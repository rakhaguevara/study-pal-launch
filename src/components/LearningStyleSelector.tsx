import { Lightbulb } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/store/useStudyStore";

const LearningStyleSelector = () => {
  const learningStyle = useStudyStore(state => state.learningStyle);
  const setLearningStyle = useStudyStore(state => state.setLearningStyle);

  const styles = [
    { value: 'visual', label: 'Visual', icon: '👁️', desc: 'Learn by seeing' },
    { value: 'auditory', label: 'Auditory', icon: '👂', desc: 'Learn by listening' },
    { value: 'reading_writing', label: 'Reading/Writing', icon: '📝', desc: 'Learn by reading & writing' },
    { value: 'kinesthetic', label: 'Kinesthetic', icon: '🤲', desc: 'Learn by doing' },
  ] as const;

  const currentStyle = styles.find(s => s.value === learningStyle);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-primary/20 hover:border-primary"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="hidden md:inline">Style: </span>
          <span className="font-semibold capitalize">
            {currentStyle?.icon} {currentStyle?.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Learning Style</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {styles.map((style) => (
          <DropdownMenuItem
            key={style.value}
            onClick={() => setLearningStyle(style.value)}
            className={`cursor-pointer ${learningStyle === style.value ? 'bg-primary/10 font-semibold' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-xl">{style.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{style.label}</div>
                <div className="text-xs text-muted-foreground">
                  {style.desc}
                </div>
              </div>
              {learningStyle === style.value && (
                <span className="text-green-600">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LearningStyleSelector;





