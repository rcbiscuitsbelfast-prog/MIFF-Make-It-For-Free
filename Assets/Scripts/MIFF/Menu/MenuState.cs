using System;

namespace MIFF.Menu
{
    /// <summary>
    /// High-level menu states for a console/headless main menu flow.
    /// </summary>
    [Serializable]
    public enum MenuState
    {
        Main,
        SaveSelect,
        Settings,
        ConfirmExit
    }
}

