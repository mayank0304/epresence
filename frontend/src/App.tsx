import { Separator } from "@radix-ui/react-separator";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "./components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import Groups from "./pages/Groups";
import { Sidebar } from "./components/Sidebar";
import Users from "./pages/Users";
import Sessions from "./pages/Sessions";
import Logs from "./pages/Logs";
import Session from "./pages/Session";

const App = () => {
  const page = useLocation().pathname.split("/")[1];
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="scale-150" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize font-semibold text-lg">
                  {page}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <Routes>
          <Route path="/" element={<Users />} />
          <Route path="/users" element={<Users />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/history" element={<Logs />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default App;
