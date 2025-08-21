using System;
using System.Collections.Generic;

namespace MIFF.Overworld
{
    /// <summary>
    /// Pure C# controller for overworld movement and facing.
    /// </summary>
    [Serializable]
    public class PlayerMovementController
    {
        public string CurrentLocationID { get; private set; }
        public Direction Facing { get; private set; } = Direction.Down;

        private readonly WorldMap worldMap;

        public event Action<string> OnLocationEntered; // locationID

        public PlayerMovementController(WorldMap map, string startLocationID)
        {
            worldMap = map ?? throw new ArgumentNullException(nameof(map));
            CurrentLocationID = startLocationID;
            OnLocationEntered?.Invoke(CurrentLocationID);
        }

        public IReadOnlyList<string> GetAdjacent()
        {
            return worldMap.GetAdjacentLocations(CurrentLocationID);
        }

        public bool MoveTo(string targetLocationID)
        {
            if (string.IsNullOrEmpty(targetLocationID)) return false;
            var adj = worldMap.GetAdjacentLocations(CurrentLocationID);
            if (adj == null) return false;
            foreach (var id in adj)
            {
                if (id == targetLocationID)
                {
                    CurrentLocationID = targetLocationID;
                    UpdateFacingFromGraphTransition(id);
                    OnLocationEntered?.Invoke(CurrentLocationID);
                    return true;
                }
            }
            return false;
        }

        public void Face(Direction direction)
        {
            Facing = direction;
        }

        // Optional WASD helpers (no actual grid math here; graph-based move)
        public bool TryMoveUp(Func<string, string> resolveNorthNeighbor) => TryDirectionalMove(Direction.Up, resolveNorthNeighbor);
        public bool TryMoveDown(Func<string, string> resolveSouthNeighbor) => TryDirectionalMove(Direction.Down, resolveSouthNeighbor);
        public bool TryMoveLeft(Func<string, string> resolveWestNeighbor) => TryDirectionalMove(Direction.Left, resolveWestNeighbor);
        public bool TryMoveRight(Func<string, string> resolveEastNeighbor) => TryDirectionalMove(Direction.Right, resolveEastNeighbor);

        private bool TryDirectionalMove(Direction dir, Func<string, string> resolver)
        {
            Facing = dir;
            if (resolver == null) return false;
            var next = resolver(CurrentLocationID);
            if (string.IsNullOrEmpty(next)) return false;
            return MoveTo(next);
        }

        private void UpdateFacingFromGraphTransition(string newLocationID)
        {
            // Hook for contributors to set facing based on edge metadata.
            // Default: keep previous facing.
        }
    }

    public enum Direction
    {
        Up,
        Down,
        Left,
        Right
    }
}

