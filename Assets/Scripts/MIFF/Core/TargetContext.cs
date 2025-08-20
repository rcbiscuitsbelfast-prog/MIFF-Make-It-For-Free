using UnityEngine;

namespace MIFF.Core
{
    /// <summary>
    /// Context information about the target of an item
    /// </summary>
    [System.Serializable]
    public class TargetContext
    {
        public GameObject targetObject;
        public Vector3 targetPosition;
        public Spirit targetSpirit;
        public bool isValidTarget;
        public string targetType; // "spirit", "player", "location", etc.
        
        public TargetContext(GameObject target, Spirit spirit = null)
        {
            targetObject = target;
            targetPosition = target != null ? target.transform.position : Vector3.zero;
            targetSpirit = spirit;
            isValidTarget = target != null;
            targetType = spirit != null ? "spirit" : "object";
        }
        
        public TargetContext(Vector3 position, string type = "location")
        {
            targetObject = null;
            targetPosition = position;
            targetSpirit = null;
            isValidTarget = true;
            targetType = type;
        }
    }
}