
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";

interface ScheduleItem {
  time: string;
  task: string;
  completed: boolean;
  details?: string;
  mealSuggestions?: string[];
}

interface TaskItemProps {
  item: ScheduleItem;
  index: number;
  expandedTaskIndex: number | null;
  toggleTaskExpansion: (index: number) => void;
  toggleTaskCompletion: (index: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  item,
  index,
  expandedTaskIndex,
  toggleTaskExpansion,
  toggleTaskCompletion,
}) => {
  const taskInfo = getTaskDetails(item.task);
  const isExpanded = expandedTaskIndex === index;

  return (
    <div 
      className={`rounded-lg transition-all duration-300 ${
        item.completed ? 'bg-green-50 text-muted-foreground' : 'hover:bg-blue-50'
      } ${
        isExpanded ? 'shadow-md border border-primary/30' : ''
      }`}
    >
      <Collapsible
        open={isExpanded}
        onOpenChange={() => {}}
        className="w-full"
      >
        <div 
          className="relative flex items-center gap-4 p-3 cursor-pointer"
          onClick={() => toggleTaskExpansion(index)}
        >
          <Button 
            variant={item.completed ? "default" : "outline"}
            size="icon"
            className={`rounded-full h-8 w-8 transition-colors duration-300 ${item.completed ? 'bg-green-500 hover:bg-green-600' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskCompletion(index);
            }}
          >
            {item.completed && <Check className="h-4 w-4" />}
          </Button>
          <div className="flex-1">
            <div className={`font-medium ${item.completed ? 'line-through' : ''}`}>{item.task}</div>
            <div className="text-sm text-muted-foreground">{item.time}</div>
          </div>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskExpansion(index);
              }}
            >
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-400 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="px-3 pb-3 pt-0">
          <div className="border-t mt-2 pt-3 animate-fade-in transition-all duration-300 ease-in-out">
            <h4 className="font-medium text-sm mb-2">Task Details:</h4>
            <p className="text-sm text-gray-600 mb-3">{taskInfo.details}</p>
            
            {taskInfo.mealSuggestions && taskInfo.mealSuggestions.length > 0 && (
              <div className="animate-slide-up transition-all duration-500 ease-in-out">
                <h4 className="font-medium text-sm mb-1">Suggested Options:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {taskInfo.mealSuggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Helper function to generate task details
const getTaskDetails = (task: string): { details: string; mealSuggestions?: string[] } => {
  const lowerCaseTask = task.toLowerCase();
  
  if (lowerCaseTask.includes('breakfast') || lowerCaseTask.includes('lunch') || 
      lowerCaseTask.includes('dinner') || lowerCaseTask.includes('meal') || 
      lowerCaseTask.includes('eat') || lowerCaseTask.includes('food')) {
    
    let mealType = 'meal';
    if (lowerCaseTask.includes('breakfast')) mealType = 'breakfast';
    if (lowerCaseTask.includes('lunch')) mealType = 'lunch';
    if (lowerCaseTask.includes('dinner')) mealType = 'dinner';
    
    let suggestions: string[] = [];
    
    if (mealType === 'breakfast') {
      suggestions = [
        "Greek yogurt with berries and granola",
        "Oatmeal with nuts and banana",
        "Whole grain toast with avocado and eggs",
        "Smoothie with spinach, banana, and protein powder",
        "Overnight chia pudding with fruit"
      ];
    } else if (mealType === 'lunch') {
      suggestions = [
        "Quinoa bowl with roasted vegetables and grilled chicken",
        "Mediterranean salad with chickpeas and feta",
        "Turkey and vegetable wrap with hummus",
        "Lentil soup with a side of whole grain bread",
        "Baked sweet potato with tuna salad"
      ];
    } else if (mealType === 'dinner') {
      suggestions = [
        "Grilled salmon with asparagus and brown rice",
        "Turkey or veggie chili with vegetables",
        "Stir-fry with tofu and mixed vegetables",
        "Roasted chicken with sweet potatoes and broccoli",
        "Zucchini noodles with tomato sauce and turkey meatballs"
      ];
    } else {
      suggestions = [
        "Apple slices with almond butter",
        "Handful of mixed nuts and dried fruits",
        "Hummus with carrot and cucumber sticks",
        "Greek yogurt with berries",
        "Hard-boiled eggs"
      ];
    }
    
    return {
      details: `This ${mealType} should focus on nutrient-dense, whole foods. Aim for a balance of protein, healthy fats, and complex carbohydrates. Stay hydrated by drinking water before and after your meal.`,
      mealSuggestions: suggestions
    };
  }
  
  if (lowerCaseTask.includes('exercise') || lowerCaseTask.includes('workout') || 
      lowerCaseTask.includes('walk') || lowerCaseTask.includes('jog') || 
      lowerCaseTask.includes('run') || lowerCaseTask.includes('gym')) {
    
    return {
      details: "Start with a 5-minute warm-up. Focus on proper form rather than intensity. End with stretching to promote recovery. Remember that consistency is more important than perfection."
    };
  }
  
  if (lowerCaseTask.includes('meditate') || lowerCaseTask.includes('meditation') || 
      lowerCaseTask.includes('mindful') || lowerCaseTask.includes('breathe') || 
      lowerCaseTask.includes('relax')) {
    
    return {
      details: "Find a quiet space where you won't be disturbed. Sit comfortably with good posture. Focus on your breath, allowing thoughts to come and go without judgment. Start with just 5 minutes if you're new to meditation."
    };
  }
  
  return {
    details: "Take your time with this task. Break it down into smaller steps if needed. Remember to stay present and focus on one thing at a time."
  };
};
