import os from 'os';

function cpuTimes() {
  const cpus = os.cpus();
  let idle = 0, total = 0;
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  });
  return { idle, total };
}

/**
 * Get CPU usage percentage
 * @returns {number} CPU usage percentage (0-100)
 */
export async function getCPUUsage() {
  const start = cpuTimes();
  await new Promise(r => setTimeout(r, 200));

  const end = cpuTimes();

  const idle = end.idle - start.idle;
  const total = end.total - start.total;
  return Math.round((1 - idle / total) * 100);
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

/**
 * Build system metadata object with CPU, memory, and platform information
 * @returns {Object} Metadata object containing system information
 */
export async function getSystemMetadata() {
  const cpuUsage = await getCPUUsage();
  const memoryUsage = getMemoryUsage();

  return {
    uptime: process.uptime(),
    memory: {
      process_used: process.memoryUsage().heapUsed,
      process_total: process.memoryUsage().heapTotal,
      system_used: memoryUsage.used,
      system_free: memoryUsage.free,
      system_total: memoryUsage.total,
      usage_percent: memoryUsage.usagePercent
    },
    cpu: {
      cores: os.cpus().length,
      usage_percent: cpuUsage,
      model: os.cpus()[0].model
    },
    platform: os.platform(),
    arch: os.arch(),
    load_average: os.loadavg()
  };
}