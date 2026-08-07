import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

type TimeLogOptions = {
  id: string;
  clientName:string;
  description: string;
  endTime: Date | null;
  durationMinutes: number;
}

interface TimeLogOptionsProps {
  timeLogs: TimeLogOptions[];
}

const CreateInvoiceDialog = ({ timeLogs }: TimeLogOptionsProps) => {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timelogs</DialogTitle>
          <DialogDescription>
            Following are all the unbilled timelogs for the client : 
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
