import os from 'os';

/**
 * Get CPU usage percentage
 * @returns {number} CPU usage percentage (0-100)
 */
export function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);

  return usage;
}

/**
 * Get memory usage information
 * @returns {Object} Memory usage object with used, free, total, and usagePercent properties
 */
export function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = (usedMem / totalMem) * 100;

  return {
    used: usedMem,
    free: freeMem,
    total: totalMem,
    usagePercent: Math.round(memUsagePercent * 100) / 100
  };
}