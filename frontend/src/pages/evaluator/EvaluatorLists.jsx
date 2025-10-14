import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const EvaluatorLists = ({ showListDialog, setShowListDialog }) => {
  const { open, type, data } = showListDialog;

  const getDialogTitle = () => {
    switch (type) {
      case 'teams': return 'All Teams';
      case 'participants': return 'All Participants';
      case 'coordinators': return 'All Coordinators';
      case 'evaluators': return 'All Evaluators';
      default: return 'List';
    }
  };

  const renderTableContent = () => {
    if (!data || data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
            No {type} found
          </TableCell>
        </TableRow>
      );
    }

    if (type === 'teams') {
      return data.map((item, index) => (
        <TableRow key={index}>
          <TableCell className="font-medium">{item.team_name}</TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {item.members?.map((member, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {member.user_name}
                </Badge>
              ))}
            </div>
          </TableCell>
          <TableCell>{item.members?.length || 0} members</TableCell>
        </TableRow>
      ));
    }

    return data.map((item, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium">{item.user_name}</TableCell>
        <TableCell>{item.user_email}</TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">
            {type.slice(0, -1)}
          </Badge>
        </TableCell>
      </TableRow>
    ));
  };

  const getTableHeaders = () => {
    if (type === 'teams') {
      return (
        <TableRow>
          <TableHead>Team Name</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Count</TableHead>
        </TableRow>
      );
    }

    return (
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
      </TableRow>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => setShowListDialog(prev => ({ ...prev, open }))}>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Complete list of {type} in this hackathon
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              {getTableHeaders()}
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluatorLists;