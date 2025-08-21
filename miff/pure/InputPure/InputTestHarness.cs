using System;

namespace MIFF.Pure.Input
{
    /// <summary>
    /// Console tester for input mapping/rebinding.
    /// </summary>
    public static class InputTestHarness
    {
        public static void Main(string[] args)
        {
            var profile = new InputProfile();
            profile.RegisterAction(new InputAction{ ActionId="move_up", DefaultInput="W", Category="movement" });
            profile.RegisterAction(new InputAction{ ActionId="move_down", DefaultInput="S", Category="movement" });
            profile.RegisterAction(new InputAction{ ActionId="confirm", DefaultInput="Enter", Category="ui" });

            var mapper = new InputMapper(profile);
            Console.WriteLine("Initial bindings:");
            foreach (var kv in profile.GetBindings()) Console.WriteLine($"{kv.Key} -> {kv.Value}");

            Console.WriteLine("\nRebinding confirm to Space...");
            mapper.RebindAction("confirm", "Space");
            foreach (var kv in profile.GetBindings()) Console.WriteLine($"{kv.Key} -> {kv.Value}");

            Console.WriteLine("\nTesting mapped actions:");
            var testInputs = new [] { "W", "S", "Space", "Enter" };
            foreach (var input in testInputs)
            {
                var action = mapper.GetMappedAction(input);
                Console.WriteLine($"Input {input} -> {(action?.ActionId ?? "(none)")}");
            }
        }
    }
}

