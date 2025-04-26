import CronTaskManager from './task-manager.js';
import { getVMList, setPowerState, getPowerState } from '../vmware/vm-operations.js';
import { vmFolder } from '../config.js';

// Create task manager instance
const taskManager = new CronTaskManager();

async function showDownAllVM() {
    console.log('Starting cron task: shutting down all user VMs');
    const vms = await getVMList([vmFolder.target]);
    for (const vm of vms) {
        const powerStateInfo = await getPowerState(vm.vm);
        console.log(`VM ${vm.vm} current power state: ${powerStateInfo.state}`);
        if (powerStateInfo.state === 'POWERED_ON') {
            await setPowerState(vm.vm, 'stop');
            console.log(`Sent shutdown command to VM ${vm.vm}`);
        } else {
            console.log(`VM ${vm.vm} skipped`);
        }
    }
    console.log('VM shutdown task completed');
}

// Register shutdown task
taskManager.registerTask(
    '1',
    '0 0 * * *',
    showDownAllVM,
    'Shut down all user VMs at midnight every day'
);

taskManager.registerTask(
    '2',
    '* * * * *',
    showDownAllVM,
    'Shut down all user VMs every minute - only for testing'
);

export default taskManager;
