import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Database, 
  Users, 
  MessageSquare, 
  Calendar, 
  Store, 
  MapPin,
  Settings,
  Shield,
  Menu,
  X
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const adminMenuItems = [
  { title: 'Overview', url: '/admin', icon: Database, exact: true },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Posts', url: '/admin/posts', icon: MessageSquare },
  { title: 'Events', url: '/admin/events', icon: Calendar },
  { title: 'Communities', url: '/admin/communities', icon: Users },
  { title: 'Marketplace', url: '/admin/marketplace', icon: Store },
  { title: 'Locations', url: '/admin/locations', icon: MapPin },
  { title: 'User Roles', url: '/admin/roles', icon: Shield },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string, exact = false) => {
    const active = isActive(path, exact);
    return active ? "bg-primary text-primary-foreground" : "hover:bg-muted/50";
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            Admin Panel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.exact}
                      className={getNavCls(item.url, item.exact)}
                    >
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}