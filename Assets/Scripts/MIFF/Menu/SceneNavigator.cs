using System;

namespace MIFF.Menu
{
    /// <summary>
    /// Pure C# abstraction for scene navigation.
    /// In Unity, implementers can hook these calls into actual SceneManager loads.
    /// </summary>
    [Serializable]
    public class SceneNavigator
    {
        public event Action<string> OnLoadScene; // sceneID
        public event Action OnReturnToMenu;

        public void LoadScene(string sceneID)
        {
            if (string.IsNullOrEmpty(sceneID)) return;
            OnLoadScene?.Invoke(sceneID);
        }

        public void ReturnToMenu()
        {
            OnReturnToMenu?.Invoke();
        }
    }
}

