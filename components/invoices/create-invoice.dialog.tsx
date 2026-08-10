import AnimatedList from "../AnimatedList";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type TimeLogOptions = {
  id: string;
  description: string;
  endTime: Date | null;
  durationMinutes: number;
};

interface TimeLogOptionsProps {
  timeLogs: TimeLogOptions[];
  clientName: string;
}

const CreateInvoiceDialog = ({ timeLogs, clientName}: TimeLogOptionsProps) => {
  const displayItems = timeLogs.map((log) => {
    const hours = (log.durationMinutes / 60).toFixed(1);
    return `${log.description}-${hours}`;
  });

  

  return (
    <div>
      <Dialog>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Timelogs - {clientName}</DialogTitle>
            <DialogDescription>
              Following are all the unbilled timelogs for this client:
            </DialogDescription>
          </DialogHeader>

          <AnimatedList
            items={displayItems}
            onItemSelect={(itemText: string, index: number) => {
              const selectedLog = timeLogs[index];
              console.log(selectedLog, index);
            }}
            enableArrowNavigation
            displayScrollbar
          />
          <Button className="bg-accent text-txt-primary">
            Prepare Invoice
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateInvoiceDialog;
