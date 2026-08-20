import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SettingsAccordion, type SettingsAccordionItem } from '@/components/settings/settings-accordion';
import { EditableNameField } from '@/components/settings/editable-name-field';
import { useWallet } from '@/lib/use-wallet';
import { fetchDashboardData, updateUserName } from '@/lib/auth-api';

export const Route = createFileRoute('/(protected)/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { address: connectedWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!connectedWallet) return;
      try {
        setIsLoading(true);
        const dashboardData = await fetchDashboardData(connectedWallet);
        if (dashboardData) {
          setUserName(dashboardData.userName);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [connectedWallet]);

  const handleUpdateName = async (newName: string) => {
    if (!connectedWallet) return;
    const saved = await updateUserName(connectedWallet, newName);
    if (saved !== null) {
      setUserName(saved);
      toast.success('Name updated!');
    } else {
      toast.error('Failed to update name');
      throw new Error('update failed');
    }
  };

  const items: SettingsAccordionItem[] = [
    {
      id: 'name',
      label: 'Display Name',
      description: 'This name is shown across your dashboard',
      render: () =>
        isLoading ? (
          <div className="animate-pulse h-10 w-full bg-white/5 rounded-2xl" />
        ) : (
          <EditableNameField currentName={userName} onUpdate={handleUpdateName} />
        ),
    },
  ];

  return (
    <div className="w-full text-white">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Settings</h2>
      </div>
      <SettingsAccordion items={items} />
    </div>
  );
}