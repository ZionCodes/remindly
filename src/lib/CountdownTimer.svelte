<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { DateTime } from 'luxon';
  
    export let targetDate;
    export let offset; 
  
    // Define writable stores for countdown values
    let days = writable(0);
    let hours = writable(0);
    let minutes = writable(0);
    let seconds = writable(0);
  
    function adjustDate(targetDate, offset) {
      // Ensure targetDate is in ISO format
      const formattedDate = targetDate.replace(' ', 'T');
  
      // Parse the formattedDate to a DateTime object in UTC
      const date = DateTime.fromISO(formattedDate, { zone: 'utc' });
  
      // Adjust the date by adding/subtracting the offset (in hours)
      const adjustedDate = date.minus({ hours: offset });
  
      // Convert the adjusted date to ISO format
      return adjustedDate.toISO();
    }
  
    function updateCountdown() {
      // Get the current time in UTC
      const now = DateTime.utc();
  
      // Convert the current time to ISO 8601 format
      const nowISO = now.toISO();
  
      // Parse the adjustedDate and nowISO using Luxon
      const adjustedDateTime = DateTime.fromISO(adjustDate(targetDate, offset));
      const nowDateTime = DateTime.fromISO(nowISO);
  
      // Calculate the difference between nowDateTime and adjustedDateTime
      const difference = adjustedDateTime.diff(nowDateTime, ['days', 'hours', 'minutes', 'seconds']).toObject();
  
      // Update writable stores with the difference
      days.set(Math.floor(difference.days || 0));
      hours.set(Math.floor(difference.hours || 0));
      minutes.set(Math.floor(difference.minutes || 0));
      seconds.set(Math.floor(difference.seconds || 0));
    }
  
    onMount(() => {
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
  
      return () => clearInterval(interval);
    });
</script>
  
  <div class="flex justify-center text-gray-600 items-center h-full">
    <div class="grid auto-cols-max grid-flow-col gap-5 text-center text-l">
      <div class="flex flex-col text-center">
        <span class="countdown font-mono">
          {$days}
        </span>
        days
      </div>
      <div class="flex flex-col text-center">
        <span class="countdown font-mono">
          {$hours}
        </span>
        hours
      </div>
      <div class="flex flex-col text-center">
        <span class="countdown font-mono">
          {$minutes}
        </span>
        min
      </div>
      <div class="flex flex-col text-center">
        <span class="countdown font-mono">
          {$seconds}
        </span>
        sec
      </div>
    </div>
  </div>
  