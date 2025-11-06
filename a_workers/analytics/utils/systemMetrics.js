import os from 'os';

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

export function createSystemMetadata() {
  const cpuUsage = getCPUUsage();
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
