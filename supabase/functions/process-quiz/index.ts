import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      userId, 
      visualScore, 
      audioScore, 
      textScore, 
      kinestheticScore, 
      timeTaken,
      age 
    } = await req.json();

    console.log('Processing quiz for user:', userId);
    console.log('Scores:', { visualScore, audioScore, textScore, kinestheticScore });

    // Determine quiz level based on age
    let quizLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    if (age < 14) quizLevel = 'beginner';
    else if (age >= 20) quizLevel = 'advanced';

    // Calculate total score
    const totalScore = visualScore + audioScore + textScore + kinestheticScore;

    // ML Classification Logic - Simple Decision Tree
    // Determine dominant learning style based on highest score
    const scores = {
      visual: visualScore,
      auditory: audioScore,
      reading_writing: textScore,
      kinesthetic: kinestheticScore
    };

    // Find the learning style with highest score
    let dominantStyle: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic' = 'visual';
    let maxScore = visualScore;

    if (audioScore > maxScore) {
      dominantStyle = 'auditory';
      maxScore = audioScore;
    }
    if (textScore > maxScore) {
      dominantStyle = 'reading_writing';
      maxScore = textScore;
    }
    if (kinestheticScore > maxScore) {
      dominantStyle = 'kinesthetic';
      maxScore = kinestheticScore;
    }

    // Advanced ML logic: Check if the dominant style is significantly higher
    const secondHighest = Object.values(scores)
      .sort((a, b) => b - a)[1];
    
    // If the difference is less than 15%, consider it a mixed style
    // For simplicity, we'll still use the dominant one but log the insight
    const dominancePercentage = ((maxScore - secondHighest) / maxScore) * 100;
    console.log(`Dominant style: ${dominantStyle} with ${dominancePercentage.toFixed(1)}% lead`);

    // Get user profile to link quiz result
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('firebase_uid', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Insert quiz result
    const { data: quizResult, error: quizError } = await supabase
      .from('quiz_results')
      .insert({
        user_id: profile.id,
        visual_score: visualScore,
        audio_score: audioScore,
        text_score: textScore,
        kinesthetic_score: kinestheticScore,
        total_score: totalScore,
        quiz_level: quizLevel,
        time_taken: timeTaken
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error inserting quiz result:', quizError);
      throw quizError;
    }

    // Update user profile with learning style and quiz completion status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        learning_style: dominantStyle,
        quiz_completed: true
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw updateError;
    }

    console.log('Quiz processed successfully. Learning style:', dominantStyle);

    return new Response(
      JSON.stringify({
        learningStyle: dominantStyle,
        quizResult: quizResult,
        dominancePercentage: dominancePercentage.toFixed(1)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});