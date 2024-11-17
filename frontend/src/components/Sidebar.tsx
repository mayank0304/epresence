import * as React from "react";
import { HistoryIcon, NotebookPen, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DatePicker } from "@/components/DatePicker";
import {
  Sidebar as _Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar({ ...props }: React.ComponentProps<typeof _Sidebar>) {
  return (
    <_Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-lg font-semibold ml-1">ePresence</h1>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <DatePicker />
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/users">
                  <SidebarMenuButton>
                    <User />
                    Users
                  </SidebarMenuButton>
                </Link>
                <Link to="/groups">
                  <SidebarMenuButton>
                    <Users />
                    Groups
                  </SidebarMenuButton>
                </Link>
                <Link to="/sessions">
                  <SidebarMenuButton>
                    <NotebookPen />
                    Sessions
                  </SidebarMenuButton>
                </Link>
                <Link to="/history">
                  <SidebarMenuButton>
                    <HistoryIcon />
                    RFID Log
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </_Sidebar>
  );
}
