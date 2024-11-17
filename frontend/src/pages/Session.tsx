import React, { useMemo } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Plus, UserMinus } from "lucide-react";

const GET_SESSION = gql`
  query GetSession($id: ID!) {
    session(id: $id) {
      id
      startTime
      endTime
      groupId
      group {
        id
        name
        description
        users {
          id
          name
          rfid
        }
      }
      createdByAdmin {
        id
        username
      }
    }
  }
`;

const GET_ATTENDANCE = gql`
  query GetAttendance($sessionId: ID!) {
    attendance(sessionId: $sessionId) {
      user {
        id
        name
        rfid
      }
      session {
        id
        startTime
        endTime
        group {
          name
        }
      }
      createdAt
    }
  }
`;

const MARK_ATTENDANCE = gql`
  mutation MarkAttendance($userId: ID!, $sessionId: ID!) {
    markAttendance(userId: $userId, sessionId: $sessionId) {
      user {
        id
      }
      session {
        id
      }
    }
  }
`;

const UNMARK_ATTENDANCE = gql`
  mutation UnmarkAttendance($userId: ID!, $sessionId: ID!) {
    unmarkAttendance(userId: $userId, sessionId: $sessionId) {
      user {
        id
      }
      session {
        id
      }
    }
  }
`;

const Session = () => {
  const { id } = useParams<{ id: string }>();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<string>("");

  const { data: sessionData, loading: sessionLoading } = useQuery(GET_SESSION, {
    variables: { id },
    skip: !id,
  });

  const {
    data: attendanceData,
    loading: attendanceLoading,
    refetch: refetchAttendance,
  } = useQuery(GET_ATTENDANCE, {
    variables: { sessionId: id },
    skip: !id,
  });

  const [markAttendance] = useMutation(MARK_ATTENDANCE);
  const [unmarkAttendance] = useMutation(UNMARK_ATTENDANCE);

  const sortedAttendance = useMemo(() => {
    if (!attendanceData?.attendance) return [];
    return [...attendanceData.attendance].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [attendanceData?.attendance]);

  // Filter available users: users in the group who haven't been marked present
  const availableUsers = useMemo(() => {
    if (!sessionData?.session?.group?.users || !attendanceData?.attendance)
      return [];

    const presentUserIds = new Set(
      attendanceData.attendance.map((record: any) => record.user.id),
    );

    return sessionData.session.group.users.filter(
      (user: any) => !presentUserIds.has(user.id),
    );
  }, [sessionData?.session?.group?.users, attendanceData?.attendance]);

  const handleMarkAttendance = async () => {
    if (!selectedUser || !id) return;

    try {
      await markAttendance({
        variables: {
          userId: selectedUser,
          sessionId: id,
        },
      });
      setIsAddModalOpen(false);
      setSelectedUser("");
      refetchAttendance();
    } catch (error: any) {
      console.error("Error marking attendance:", error.message);
    }
  };

  const handleUnmarkAttendance = async (userId: string) => {
    if (!id) return;

    try {
      await unmarkAttendance({
        variables: {
          userId,
          sessionId: id,
        },
      });
      refetchAttendance();
    } catch (error: any) {
      console.error("Error unmarking attendance:", error.message);
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (sessionLoading || attendanceLoading) {
    return (
      <div className="mx-auto mt-12">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  }

  const session = sessionData?.session;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="w-full p-2 md:p-4 lg:p-8 flex flex-col gap-6">
      {/* Session Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{session.group.name}</h1>
          <p className="text-muted-foreground">{session.group.description}</p>
          <div className="flex flex-col text-sm">
            <p>Started: {formatDateTime(session.startTime)}</p>
            {session.endTime && <p>Ended: {formatDateTime(session.endTime)}</p>}
            <p>Created by: {session.createdByAdmin.username}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          disabled={availableUsers.length === 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Attendance
        </Button>
      </div>

      {/* Attendance Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>RFID</TableHead>
              <TableHead>Time Recorded</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAttendance.map((record: any) => (
              <TableRow key={`${record.user.id}-${record.createdAt}`}>
                <TableCell className="font-medium">
                  {record.user.name}
                </TableCell>
                <TableCell>{record.user.rfid}</TableCell>
                <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleUnmarkAttendance(record.user.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sortedAttendance.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Attendance Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attendance Record</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.rfid})
                  </SelectItem>
                ))}
                {availableUsers.length === 0 && (
                  <SelectItem value="" disabled>
                    No users available to mark present
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkAttendance} disabled={!selectedUser}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Session;
