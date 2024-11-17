import { gql, useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle, Plus } from "lucide-react";

const Groups = () => {
  const getGroupsQuery = gql`
    query {
      groups {
        id
        name
        description
        createdAt
        users {
          id
          name
          rfid
        }
      }
    }
  `;

  const getAllUsersQuery = gql`
    query {
      users {
        id
        name
        rfid
      }
    }
  `;

  const createGroupMutation = gql`
    mutation createGroup($name: String!, $description: String!) {
      createGroup(name: $name, description: $description) {
        id
        name
        description
      }
    }
  `;

  const addUserToGroupMutation = gql`
    mutation addUserToGroup($userId: ID!, $groupId: ID!) {
      addUserToGroup(userId: $userId, groupId: $groupId) {
        id
      }
    }
  `;

  const removeUserFromGroupMutation = gql`
    mutation removeUserFromGroup($userId: ID!, $groupId: ID!) {
      removeUserFromGroup(userId: $userId, groupId: $groupId) {
        id
      }
    }
  `;

  const deleteGroupMutation = gql`
    mutation deleteGroup($id: ID!) {
      deleteGroup(id: $id) {
        id
      }
    }
  `;

  const { loading, error, data, refetch } = useQuery(getGroupsQuery);
  const { data: allUsersData } = useQuery(getAllUsersQuery);
  const [createGroup] = useMutation(createGroupMutation);
  const [addUserToGroup] = useMutation(addUserToGroupMutation);
  const [removeUserFromGroup] = useMutation(removeUserFromGroupMutation);
  const [deleteGroup] = useMutation(deleteGroupMutation);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newUserId, setNewUserId] = useState("");

  if (loading)
    return (
      <div className="mx-auto mt-12">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  const groups = data.groups.map((group: any) => {
    const date = new Date(group.createdAt);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    return {
      ...group,
      createdAt: formattedDate,
    };
  });

  // Filter out users that are already in the selected group
  const getAvailableUsers = () => {
    if (!allUsersData?.users || !selectedGroup) return [];
    const groupUserIds = selectedGroup.users.map((user: any) => user.id);
    return allUsersData.users.filter(
      (user: any) => !groupUserIds.includes(user.id),
    );
  };

  const handleCreateGroup = async () => {
    try {
      await createGroup({
        variables: {
          name: newGroupName,
          description: newGroupDescription,
        },
      });
      setIsCreateModalOpen(false);
      setNewGroupName("");
      setNewGroupDescription("");
      refetch();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup({ variables: { id } });
      refetch();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleAddUserToGroup = async () => {
    if (!newUserId) return;
    try {
      await addUserToGroup({
        variables: {
          userId: newUserId,
          groupId: selectedGroup.id,
        },
      });
      setIsAddUserModalOpen(false);
      setNewUserId("");
      refetch();
    } catch (error) {
      console.error("Error adding user to group:", error);
    }
  };

  const handleRemoveUserFromGroup = async (groupId: string, userId: string) => {
    try {
      await removeUserFromGroup({
        variables: {
          userId,
          groupId,
        },
      });
      refetch();
    } catch (error) {
      console.error("Error removing user from group:", error);
    }
  };

  return (
    <div className="w-full p-2 md:p-4 lg:p-8 flex flex-col gap-4">
      <Button className="ml-auto" onClick={() => setIsCreateModalOpen(true)}>
        <Plus />
        Create Group
      </Button>
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {groups.map((group: any) => (
          <div
            key={group.id}
            className="p-4 bg-secondary rounded-xl flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{group.name}</p>
                <p className="text-sm font-light">{group.description}</p>
                <p className="text-xs font-light">Created: {group.createdAt}</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteGroup(group.id)}
              >
                Delete
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Members</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedGroup(group);
                    setNewUserId("");
                    setIsAddUserModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {group.users?.length > 0 ? (
                  group.users.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex justify-between items-center bg-background/50 p-2 rounded"
                    >
                      <p>{user.name}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleRemoveUserFromGroup(group.id, user.id)
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No members</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Create Group Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Input
                placeholder="Group Description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add User Modal */}
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to {selectedGroup?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableUsers().map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsAddUserModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUserToGroup}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Groups;
