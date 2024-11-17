import { gql, useMutation, useQuery } from "@apollo/client";
import { LoaderCircle, Plus } from "lucide-react";
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

const Users = () => {
  const getUsersQuery = gql`
    query {
      users {
        id
        rfid
        name
        createdAt
      }
    }
  `;

  const updateUserRfidMutation = gql`
    mutation updateUserRfid($id: ID!, $rfid: String!) {
      updateUserRfid(id: $id, rfid: $rfid) {
        id
        rfid
      }
    }
  `;

  const deleteUserMutation = gql`
    mutation deleteUser($id: ID!) {
      deleteUser(id: $id) {
        id
      }
    }
  `;

  const createUserMutation = gql`
    mutation createUser($name: String!, $rfid: String!) {
      createUser(name: $name, rfid: $rfid) {
        id
        name
        rfid
        createdAt
      }
    }
  `;

  const { loading, error, data, refetch } = useQuery(getUsersQuery);
  const [updateUserRfid] = useMutation(updateUserRfidMutation);
  const [deleteUser] = useMutation(deleteUserMutation);
  const [createUser] = useMutation(createUserMutation);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    rfid: string;
  } | null>(null);
  const [newRfid, setNewRfid] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRfid, setNewUserRfid] = useState("");

  if (loading)
    return (
      <div className="mx-auto mt-12">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  if (error) return <p>Error :</p>;

  const users = data.users.map((user: any) => {
    const date = new Date(user.createdAt);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(
        2,
        "0",
      )}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return {
      ...user,
      createdAt: formattedDate,
    };
  });

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setNewRfid(user.rfid);
    setIsEditModalOpen(true);
  };

  const handleUpdateRfid = async () => {
    if (selectedUser) {
      try {
        await updateUserRfid({
          variables: {
            id: selectedUser.id,
            rfid: newRfid,
          },
        });
        setIsEditModalOpen(false);
        refetch();
      } catch (error) {
        console.error("Error updating RFID:", error);
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser({ variables: { id } });
      refetch();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        variables: {
          name: newUserName,
          rfid: newUserRfid,
        },
      });
      setIsCreateModalOpen(false);
      setNewUserName("");
      setNewUserRfid("");
      refetch();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div className="w-full p-2 md:p-4 lg:p-8 flex flex-col gap-4">
      <Button className="ml-auto" onClick={() => setIsCreateModalOpen(true)}>
        <Plus />
        Create User
      </Button>
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {users.map((user: any) => (
          <div
            key={user.id}
            className="p-4 bg-secondary rounded-xl flex w-full justify-between gap-4"
          >
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm font-light">{user.rfid}</p>
              <p className="text-sm font-light">{user.createdAt}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => openEditModal(user)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}

        {/* Edit RFID Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit RFID for {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Enter new RFID"
                value={newRfid}
                onChange={(e) => setNewRfid(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateRfid}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Enter name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <Input
                placeholder="Enter RFID"
                value={newUserRfid}
                onChange={(e) => setNewUserRfid(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Users;
