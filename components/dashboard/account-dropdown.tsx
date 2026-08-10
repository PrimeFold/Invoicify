import {
  User,
  TriangleAlert,
  UserRound,
  Settings2,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";

const AccountDropDown = ({
  name,
  email,
  emailVerified,
}: {
  name: string;
  email: string;
  emailVerified: boolean;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none active-press">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line/80 bg-surface/80 text-txt-primary shadow-xs transition-all duration-200 hover:scale-105 hover:border-primary/50 hover:bg-surface hover:text-primary">
          <User size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-68 glass-panel p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 origin-top-right"
      >
        <div className="mb-2 rounded-xl border border-line/60 bg-canvas/60 p-3">
          <p className="text-xs font-semibold text-txt-primary tracking-tight">{name}</p>
          <p className="text-[11px] text-txt-secondary truncate font-mono mt-0.5">{email}</p>
          <div className="mt-2.5">
            {emailVerified ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-paid-bg text-status-paid border border-status-paid-border">
                <CheckCircle2 className="h-3 w-3" />
                Verified Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-pending-bg text-status-pending border border-status-pending-border">
                <TriangleAlert className="h-3 w-3" />
                Verification Pending
              </span>
            )}
          </div>
        </div>

        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-txt-primary focus:bg-surface-hover active-press transition-colors">
            <UserRound size={15} className="text-txt-muted" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-txt-primary focus:bg-surface-hover active-press transition-colors">
            <Settings2 size={15} className="text-txt-muted" />
            <span>Preferences</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-line/60" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive active-press transition-colors">
            <LogOut size={15} />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropDown;
