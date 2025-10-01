import React from 'react';
import { 
  Home, 
  Heart, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  CheckCircle,
  LogOut,
  User
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'child-profiles', label: 'Child Profiles', icon: Users },
  { id: 'behavior-log', label: 'Behavior Log', icon: Heart },
  { id: 'family-script-generator', label: 'Family Notes', icon: FileText },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'production-assessment', label: 'System Status', icon: CheckCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];