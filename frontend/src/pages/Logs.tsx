import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { gql, useQuery } from "@apollo/client";
import { LoaderCircle } from "lucide-react";

const Logs = () => {
  const getLogQuery = gql`
    query {
      rfidLogs {
        id
        rfid
        createdAt
      }
    }
  `;

  const { loading, error, data } = useQuery(getLogQuery);

  if (loading)
    return (
      <div className="mx-auto mt-12">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  if (error) return <p>Error :</p>;

  const logs = data.rfidLogs.map((log: any) => {
    const date = new Date(log.createdAt);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    return {
      ...log,
      createdAt: formattedDate,
    };
  });

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold">Logs</h2>
      <Table className="border rounded-lg max-w-xl mx-auto">
        <TableHeader>
          <TableRow>
            <TableHead>RFID</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log: any) => (
            <TableRow key={log.id}>
              <TableCell>{log.rfid}</TableCell>
              <TableCell>{log.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Logs;
