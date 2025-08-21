using System;
using System.Diagnostics;

namespace MIFF.Pure.Perf
{
    public class PerfTimer : IDisposable
    {
        private readonly string _label;
        private readonly Stopwatch _sw;
        public PerfTimer(string label)
        {
            _label = label;
            _sw = Stopwatch.StartNew();
        }
        public void Dispose()
        {
            _sw.Stop();
            Console.WriteLine($"[perf] {_label}: {_sw.ElapsedMilliseconds} ms");
        }
    }
}

