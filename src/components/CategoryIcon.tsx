import React from 'react';
import { 
  Utensils, 
  Car, 
  Home, 
  ShoppingBag, 
  Film, 
  HeartPulse, 
  GraduationCap, 
  Smile, 
  MoreHorizontal, 
  Banknote, 
  Briefcase, 
  TrendingUp, 
  Gift, 
  Coins, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Smile,
  MoreHorizontal,
  Banknote,
  Briefcase,
  TrendingUp,
  Gift,
  Coins,
  HelpCircle,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-5 h-5", size = 20 }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} size={size} />;
};
