
import { User, TriangleAlert, UserRound, Settings2, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { Badge } from '../ui/badge';

const AccountDropDown = ({name,email,emailVerified}:{name:string; email:string ; emailVerified:boolean}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-txt-primary shadow-xs transition-all duration-200 hover:scale-105 hover:border-primary hover:bg-accent/70 hover:text-primary">
          <User size={18} />
        </div>
      </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={8} className="w-64 rounded-xl border border-line bg-surface p-2 shadow-lg">
                <div className="mb-2 rounded-lg border border-line bg-canvas/70 px-3 py-2">
                  <p className="text-sm font-semibold text-txt-primary">{name}</p>
                  <p className="text-sm text-txt-secondary mb-2">{email}</p>
                  <p className="mt-1 text-xs text-txt-muted">
                    <Badge
                      className="flex w-fit items-center gap-1 border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    >
                      <TriangleAlert className="h-3.5 w-3.5" />
                      {emailVerified ? "Verified account" : "Verification pending"}
                    </Badge>
                  </p>
                </div>

                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-txt-primary focus:bg-surface-hover focus:text-txt-primary">
                    <UserRound size={16} className="text-txt-secondary" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-txt-primary focus:bg-surface-hover focus:text-txt-primary">
                    <Settings2 size={16} className="text-txt-secondary" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
  )
}

export default AccountDropDown
