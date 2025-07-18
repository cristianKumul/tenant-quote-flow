import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

export function UserSwitcher() {
  const { state, switchUser } = useApp();
  
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border">
      <div className="flex flex-col">
        <span className="text-sm font-medium">Current User:</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{state.currentUser.name}</span>
          <Badge variant={state.currentUser.role === 'SUPERADMIN' ? 'destructive' : 'secondary'}>
            {state.currentUser.role}
          </Badge>
        </div>
      </div>
      
      <Select value={state.currentUser.id} onValueChange={switchUser}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {state.users.filter(u => u.isActive).map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <span>{user.name}</span>
                <Badge variant={user.role === 'SUPERADMIN' ? 'destructive' : 'secondary'} className="text-xs">
                  {user.role}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}