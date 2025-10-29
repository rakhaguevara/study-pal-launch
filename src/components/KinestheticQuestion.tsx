import { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Pair {
  id: string;
  left: string;
  right: string;
}

interface KinestheticQuestionProps {
  pairs: Pair[];
  onAnswer: (matches: { leftId: string; rightId: string }[]) => void;
  isAnswered: boolean;
  correctMatches: { leftId: string; rightId: string }[];
  questionId?: number;
}

interface MatchResult {
  leftId: string;
  rightId: string;
}

// Icons based on topic type
const getTopicIcon = (text: string, index: number) => {
  const icons = ['🎨', '🧱', '🧠', '🔊', '📐', '⚡', '🌟', '🎯'];
  return icons[index % icons.length];
};

// Draggable Item Component
const DraggableItem = ({ 
  item, 
  side, 
  feedback,
  animationState,
  onRemove
}: { 
  item: { id: string; text: string; icon: string }; 
  side: 'left' | 'right'; 
  feedback?: 'correct' | 'incorrect' | null;
  animationState?: 'pop' | 'none';
  onRemove?: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: `${side}-${item.id}`,
    data: { type: side === 'left' ? 'drag-item' : 'matched-item', item, side }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getBorderColor = () => {
    if (feedback === 'correct') return 'border-green-500';
    if (feedback === 'incorrect') return 'border-red-500';
    return 'border-white/20';
  };

  const getBgColor = () => {
    if (feedback === 'correct') return 'bg-green-500/20';
    if (feedback === 'incorrect') return 'bg-red-500/20';
    return 'bg-white/5 hover:bg-white/10';
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={animationState === 'pop' ? { scale: 0.8 } : {}}
      animate={animationState === 'pop' ? { scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing
        ${getBgColor()}
        ${getBorderColor()}
        transition-all duration-300
        ${isDragging ? 'scale-90 shadow-2xl z-50' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icon}</span>
          <span className="text-white font-medium">{item.text}</span>
        </div>
        <div className="flex items-center gap-2">
          {feedback === 'correct' && <Check className="h-5 w-5 text-green-500 flex-shrink-0" />}
          {feedback === 'incorrect' && <X className="h-5 w-5 text-red-500 flex-shrink-0" />}
          {side === 'right' && onRemove && !feedback && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
              aria-label="Remove"
            >
              <ArrowLeft className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Droppable zone wrapper
const DroppableZone = ({ 
  id, 
  children,
  isEmpty,
  pairTitle,
  pairIcon
}: { 
  id: string; 
  children: React.ReactNode;
  isEmpty: boolean;
  pairTitle: string;
  pairIcon: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'drop-zone' }
  });

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
        <span>{pairIcon}</span> {pairTitle}
      </h4>
      
      <div
        ref={setNodeRef}
        className={`
          min-h-[60px] rounded-lg border-2 transition-all
          ${isOver ? 'border-orange-500 bg-orange-500/20 scale-105' : 'border-dashed border-white/10'}
          ${isEmpty ? 'flex items-center justify-center' : ''}
        `}
      >
        {isEmpty ? (
          <p className="text-gray-500 text-sm">Drop here</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Main Kinesthetic Question Component
const KinestheticQuestion = ({ 
  pairs, 
  onAnswer, 
  isAnswered, 
  correctMatches,
  questionId = 0 
}: KinestheticQuestionProps) => {
  const [leftItems, setLeftItems] = useState<Pair[]>(pairs);
  const [rightZones, setRightZones] = useState<{ [rightId: string]: Pair | null }>({});
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Pair | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackActive, setFeedbackActive] = useState(false);
  const [animationStates, setAnimationStates] = useState<{ [key: string]: 'pop' | 'none' }>({});
  const [submitted, setSubmitted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize right zones based on pairs
  useEffect(() => {
    const zones: { [key: string]: Pair | null } = {};
    pairs.forEach(pair => {
      zones[pair.id] = null;
    });
    setRightZones(zones);
  }, [pairs]);

  // Load from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(`kinesthetic-state-${questionId}`);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setLeftItems(state.leftItems || pairs);
        setRightZones(state.rightZones || {});
        setMatches(state.matches || []);
        setSubmitted(state.submitted || false);
        if (state.submitted) setFeedbackActive(true);
      } catch (e) {
        console.error('Failed to load session state:', e);
      }
    }
  }, [questionId, pairs]);

  // Save to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`kinesthetic-state-${questionId}`, JSON.stringify({
      leftItems,
      rightZones,
      matches,
      submitted
    }));
  }, [leftItems, rightZones, matches, submitted, questionId]);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveId(draggedId);
    
    // Get the item being dragged
    const [side, ...idParts] = draggedId.split('-');
    const id = idParts.join('-');
    
    if (side === 'left') {
      const item = leftItems.find(item => item.id === id);
      setActiveItem(item || null);
    } else if (side === 'right') {
      const item = Object.values(rightZones).find(item => item?.id === id);
      setActiveItem(item || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const draggedId = active.id as string;
    const targetId = over.id as string;

    // Parse dragged item
    const [draggedSide, ...draggedIdParts] = draggedId.split('-');
    const draggedItemId = draggedIdParts.join('-');

    // Case 1: Dropping onto a drop zone (from left or right)
    if (targetId.startsWith('drop-')) {
      const dropZoneId = targetId.replace('drop-', '');
      
      // Find the dragged item
      let draggedItem: Pair | null = null;
      
      if (draggedSide === 'left') {
        draggedItem = leftItems.find(item => item.id === draggedItemId) || null;
      } else if (draggedSide === 'right') {
        // Allow moving from one drop zone to another or back to left
        draggedItem = rightZones[draggedItemId] || null;
      }

      if (draggedItem) {
        // Only drop if the zone is empty or we're replacing it
        if (rightZones[dropZoneId] === null || draggedSide === 'right') {
          // Remove from source
          if (draggedSide === 'left') {
            setLeftItems(prev => prev.filter(item => item.id !== draggedItemId));
          } else if (draggedSide === 'right') {
            setRightZones(prev => ({ ...prev, [draggedItemId]: null }));
            // Remove from matches
            setMatches(prev => prev.filter(m => m.rightId !== draggedItemId));
          }
          
          // If zone already had an item, put it back to left
          if (rightZones[dropZoneId] && draggedSide === 'right') {
            const oldItem = rightZones[dropZoneId];
            if (oldItem) {
              setLeftItems(prev => [...prev, oldItem]);
              setMatches(prev => prev.filter(m => m.rightId !== dropZoneId));
            }
          }
          
          // Add to target zone
          setRightZones(prev => ({
            ...prev,
            [dropZoneId]: draggedItem!
          }));

          // Update matches
          setMatches(prev => {
            const filtered = prev.filter(m => m.leftId !== draggedItemId);
            return [...filtered, { leftId: draggedItemId, rightId: dropZoneId }];
          });

          // Add pop animation
          setAnimationStates(prev => ({ ...prev, [draggedItemId]: 'pop' }));
          setTimeout(() => {
            setAnimationStates(prev => ({ ...prev, [draggedItemId]: 'none' }));
          }, 500);
        }
      }
    }
    // Case 2: Dropping back to left area (from right drop zones)
    else if (targetId === 'left-return-area' && draggedSide === 'right') {
      // Remove from right zone
      setRightZones(prev => ({ ...prev, [draggedItemId]: null }));
      
      // Add back to left items
      const itemToReturn = rightZones[draggedItemId];
      if (itemToReturn) {
        setLeftItems(prev => [...prev, itemToReturn]);
      }
      
      // Remove from matches
      setMatches(prev => prev.filter(m => m.leftId !== draggedItemId));
    }
    // Case 3: Reordering within left items
    else if (targetId.startsWith('left-') && draggedSide === 'left') {
      const targetItemId = targetId.split('-').slice(1).join('-');
      
      const draggedIndex = leftItems.findIndex(item => item.id === draggedItemId);
      const targetIndex = leftItems.findIndex(item => item.id === targetItemId);
      
      if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        setLeftItems(arrayMove(leftItems, draggedIndex, targetIndex));
      }
    }
  };

  const handleRemoveFromRight = (itemId: string) => {
    const itemToReturn = rightZones[itemId];
    if (itemToReturn) {
      // Remove from right zone
      setRightZones(prev => ({ ...prev, [itemId]: null }));
      
      // Add back to left
      setLeftItems(prev => [...prev, itemToReturn]);
      
      // Remove from matches
      setMatches(prev => prev.filter(m => m.leftId !== itemToReturn.id));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setFeedbackActive(true);
    setShowFeedback(true);
    
    // Calculate results
    const correctCount = matches.filter(match => match.leftId === match.rightId).length;
    const total = pairs.length;
    const allCorrect = correctCount === total;

    setTimeout(() => {
      setShowFeedback(false);
      onAnswer(matches);
    }, allCorrect ? 2000 : 3000);
  };

  const allMatched = matches.length === pairs.length;
  const progress = Math.min((matches.length / pairs.length) * 100, 100);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Instructions with progress */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-purple-500/10 rounded-lg border-2 border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-medium">
              🎮 Drag each item to its matching pair
            </p>
            <span className="text-xs text-gray-400">
              {matches.length}/{pairs.length} matched
            </span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-lg border-2 ${
                matches.every(m => m.leftId === m.rightId) 
                  ? 'bg-green-500/20 border-green-500' 
                  : 'bg-yellow-500/20 border-yellow-500'
              }`}
            >
              <p className={`font-semibold flex items-center gap-2 ${
                matches.every(m => m.leftId === m.rightId) 
                  ? 'text-green-400' 
                  : 'text-yellow-400'
              }`}>
                <Sparkles className="h-5 w-5" />
                {matches.every(m => m.leftId === m.rightId) 
                  ? '✅ Excellent! All matches correct!' 
                  : '❌ Some matches are incorrect. Review the highlighted items.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Draggable Items */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🏷️ Items to Drag
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Drag items from here to match them with the correct answers</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            
            <SortableContext items={leftItems.map(item => `left-${item.id}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
                {leftItems.map((item) => (
                  <DraggableItem
                    key={`left-${item.id}`}
                    item={{
                      id: item.id,
                      text: item.left,
                      icon: getTopicIcon(item.left, parseInt(item.id))
                    }}
                    side="left"
                    animationState={animationStates[item.id]}
                  />
                ))}
                {leftItems.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">All items matched!</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </div>

          {/* Right: Drop Zones */}
          <div className="space-y-4">
            {pairs.map((pair) => {
              const matchedItem = rightZones[pair.id];
              const itemId = matchedItem ? `right-${matchedItem.id}` : null;
              
              return (
                <DroppableZone 
                  key={pair.id} 
                  id={`drop-${pair.id}`} 
                  isEmpty={!matchedItem}
                  pairTitle={pair.right}
                  pairIcon={getTopicIcon(pair.right, parseInt(pair.id))}
                >
                  {matchedItem ? (
                    <SortableContext items={[itemId!]} strategy={verticalListSortingStrategy}>
                      <DraggableItem
                        key={`right-${matchedItem.id}`}
                        item={{
                          id: matchedItem.id,
                          text: matchedItem.left,
                          icon: getTopicIcon(matchedItem.left, parseInt(matchedItem.id))
                        }}
                        side="right"
                        feedback={feedbackActive ? (matchedItem.id === pair.id ? 'correct' : 'incorrect') : null}
                        animationState={animationStates[matchedItem.id]}
                        onRemove={() => handleRemoveFromRight(pair.id)}
                      />
                    </SortableContext>
                  ) : null}
                </DroppableZone>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        {allMatched && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold"
              size="lg"
              disabled={submitted}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Submit Answers
            </Button>
          </motion.div>
        )}

        {/* Drag Overlay - follows cursor properly */}
        <DragOverlay>
          {activeId && activeItem && (
            <div className="p-4 rounded-lg border-2 border-orange-500 bg-orange-500/30 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTopicIcon(activeItem.left, parseInt(activeItem.id))}</span>
                <span className="text-white font-medium">{activeItem.left}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default KinestheticQuestion;
