import { Button } from "@/components/ui/button";
import { StopCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionCardProps {
  session: {
    id: string;
    startTime: string;
    endTime: string | null;
    group: {
      name: string;
    };
    createdByAdmin: {
      username: string;
    };
  };
  isActive?: boolean;
  onEndSession?: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const SessionCard = ({
  session,
  isActive = false,
  onEndSession,
  onDeleteSession,
}: SessionCardProps) => {
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div
      className={`p-4 ${isActive ? "bg-secondary" : "bg-secondary/50"} rounded-xl flex flex-col gap-2`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <Link
            to={`/session/${session.id}`}
            className="flex items-end gap-1 cursor-pointer"
          >
            <p className="font-semibold text-xl">{session.group.name}</p>
            <p className="font-light">{session.createdByAdmin.username}</p>
          </Link>
          <div>
            <p className="text-sm">
              Started: {formatDateTime(session.startTime)}
            </p>
            {session.endTime && (
              <p className="text-sm">
                Ended: {formatDateTime(session.endTime)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isActive && onEndSession && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEndSession(session.id)}
            >
              <StopCircle className="h-4 w-4 mr-1" />
              End
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeleteSession(session.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
