import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const RoleChangeConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  userNames, 
  currentRole, 
  newRole,
  isCoordinatorChange,
  coordinatorInfo,
  selectedNewCoordinator,
  setSelectedNewCoordinator
}) => {
  const handleConfirm = () => {
    if (isCoordinatorChange && coordinatorInfo?.teamsCount > 0 && !selectedNewCoordinator) {
      return; // Don't proceed if coordinator replacement is required but not selected
    }
    onConfirm(selectedNewCoordinator);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Are you sure you want to change the role of{' '}
              <span className="font-semibold">
                {userNames.length === 1 ? userNames[0] : `${userNames.length} users`}
              </span>{' '}
              from <span className="font-semibold text-blue-600">{currentRole}</span> to{' '}
              <span className="font-semibold text-green-600">{newRole}</span>?
            </div>
            
            {isCoordinatorChange && coordinatorInfo?.teamsCount > 0 && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  ⚠️ Coordinator Assignment Required
                </p>
                <p className="text-sm text-yellow-700 mb-3">
                  This user is currently coordinating {coordinatorInfo.teamsCount} team(s). 
                  Please select a new coordinator to take over these teams:
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="new-coordinator">Select New Coordinator</Label>
                  <Select value={selectedNewCoordinator} onValueChange={setSelectedNewCoordinator}>
                    <SelectTrigger id="new-coordinator">
                      <SelectValue placeholder="Choose replacement coordinator..." />
                    </SelectTrigger>
                    <SelectContent>
                      {coordinatorInfo.availableCoordinators?.map((coordinator) => (
                        <SelectItem key={coordinator._id} value={coordinator._id}>
                          {coordinator.user_name} ({coordinator.role_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {coordinatorInfo.teams?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Teams: {coordinatorInfo.teams.map(t => t.team_name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isCoordinatorChange && coordinatorInfo?.teamsCount > 0 && !selectedNewCoordinator}
          >
            Confirm Change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const UnassignConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  userNames, 
  currentRole,
  isCoordinatorChange,
  coordinatorInfo,
  selectedNewCoordinator,
  setSelectedNewCoordinator
}) => {
  const handleConfirm = () => {
    if (isCoordinatorChange && coordinatorInfo?.teamsCount > 0 && !selectedNewCoordinator) {
      return; // Don't proceed if coordinator replacement is required but not selected
    }
    onConfirm(selectedNewCoordinator);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Role Unassignment</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Are you sure you want to unassign{' '}
              <span className="font-semibold">
                {userNames.length === 1 ? userNames[0] : `${userNames.length} users`}
              </span>{' '}
              from <span className="font-semibold text-blue-600">{currentRole}</span> role?
              They will be changed to <span className="font-semibold text-green-600">participant</span>.
            </div>
            
            {isCoordinatorChange && coordinatorInfo?.teamsCount > 0 && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  ⚠️ Coordinator Assignment Required
                </p>
                <p className="text-sm text-yellow-700 mb-3">
                  This user is currently coordinating {coordinatorInfo.teamsCount} team(s). 
                  Please select a new coordinator to take over these teams:
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="new-coordinator-unassign">Select New Coordinator</Label>
                  <Select value={selectedNewCoordinator} onValueChange={setSelectedNewCoordinator}>
                    <SelectTrigger id="new-coordinator-unassign">
                      <SelectValue placeholder="Choose replacement coordinator..." />
                    </SelectTrigger>
                    <SelectContent>
                      {coordinatorInfo.availableCoordinators?.map((coordinator) => (
                        <SelectItem key={coordinator._id} value={coordinator._id}>
                          {coordinator.user_name} ({coordinator.role_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {coordinatorInfo.teams?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Teams: {coordinatorInfo.teams.map(t => t.team_name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isCoordinatorChange && coordinatorInfo?.teamsCount > 0 && !selectedNewCoordinator}
          >
            Confirm Unassignment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};