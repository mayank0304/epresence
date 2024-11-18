import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle, Plus } from "lucide-react";
import SessionCard from "@/components/SessionCard";

const Sessions = () => {
  const getSessionsQuery = gql`
    query GetSessions($groupId: ID, $createdBy: ID) {
      sessions(groupId: $groupId, createdBy: $createdBy) {
        id
        startTime
        endTime
        createdAt
        groupId
        createdBy
        group {
          id
          name
          description
        }
        createdByAdmin {
          id
          username
          rfid
        }
      }
    }
  `;

  const getGroupsQuery = gql`
    query {
      groups {
        id
        name
        description
      }
    }
  `;

  const createSessionMutation = gql`
    mutation CreateSession($groupId: ID!, $createdBy: ID!) {
      createSession(groupId: $groupId, createdBy: $createdBy) {
        id
        startTime
        endTime
        createdAt
        groupId
        createdBy
      }
    }
  `;

  const endSessionMutation = gql`
    mutation EndSession($id: ID!) {
      endSession(id: $id) {
        id
        endTime
      }
    }
  `;

  const deleteSessionMutation = gql`
    mutation DeleteSession($id: ID!) {
      deleteSession(id: $id) {
        id
      }
    }
  `;

  const [selectedGroupFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSessionGroup, setNewSessionGroup] = useState<string>("");

  const { loading, error, data, refetch } = useQuery(getSessionsQuery, {
    variables: {
      groupId: selectedGroupFilter || undefined,
    },
  });

  const { data: groupsData, loading: groupsLoading } = useQuery(getGroupsQuery);

  const [createSession] = useMutation(createSessionMutation);
  const [endSession] = useMutation(endSessionMutation);
  const [deleteSession] = useMutation(deleteSessionMutation);

  const activeSessions = useMemo(() => {
    if (!data?.sessions) return [];
    return data.sessions.filter((session: any) => !session.endTime);
  }, [data?.sessions]);

  const pastSessions = useMemo(() => {
    if (!data?.sessions) return [];
    return data.sessions.filter((session: any) => session.endTime);
  }, [data?.sessions]);

  const handleCreateSession = async () => {
    if (!newSessionGroup) return;

    try {
      await createSession({
        variables: {
          groupId: newSessionGroup,
          createdBy: 1,
        },
      });
      setIsCreateModalOpen(false);
      setNewSessionGroup("");
      refetch();
    } catch (error: any) {
      console.error("Error creating session:", error.message);
      // You might want to show an error message to the user here
    }
  };

  const handleEndSession = async (id: string) => {
    try {
      await endSession({
        variables: { id },
      });
      refetch();
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession({
        variables: { id },
      });
      refetch();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  if (loading)
    return (
      <div className="mx-auto mt-12">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="w-full p-2 md:p-4 lg:p-8 flex flex-col gap-4">
      <div className="flex justify-end items-center">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Session
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Active Sessions */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map((session: any) => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={true}
                onEndSession={handleEndSession}
                onDeleteSession={handleDeleteSession}
              />
            ))}
            {activeSessions.length === 0 && (
              <p className="text-muted-foreground">No active sessions</p>
            )}
          </div>
        </div>

        {/* Past Sessions */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Past Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastSessions.map((session: any) => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={false}
                onDeleteSession={handleDeleteSession}
              />
            ))}
            {pastSessions.length === 0 && (
              <p className="text-muted-foreground">No past sessions</p>
            )}
          </div>
        </div>
      </div>
      {/* Create Session Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {!groupsLoading && (
              <Select
                value={newSessionGroup}
                onValueChange={setNewSessionGroup}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groupsData?.groups?.map((group: any) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sessions;
