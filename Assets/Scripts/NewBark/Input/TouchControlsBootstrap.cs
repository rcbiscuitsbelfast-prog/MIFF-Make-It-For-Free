using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.InputSystem.OnScreen;

namespace NewBark.Input
{
	public static class TouchControlsBootstrap
	{
		[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
		private static void Initialize()
		{
			if (Application.platform != RuntimePlatform.Android)
			{
				return;
			}

			CreateTouchControlsCanvas();
		}

		private static void CreateTouchControlsCanvas()
		{
			var canvasGo = new GameObject("TouchControlsCanvas");
			Object.DontDestroyOnLoad(canvasGo);

			var canvas = canvasGo.AddComponent<Canvas>();
			canvas.renderMode = RenderMode.ScreenSpaceOverlay;
			canvas.sortingOrder = 32767; // draw above everything

			var scaler = canvasGo.AddComponent<CanvasScaler>();
			scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
			scaler.referenceResolution = new Vector2(1280, 720);
			scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
			scaler.matchWidthOrHeight = 0.5f;

			canvasGo.AddComponent<GraphicRaycaster>();

			EnsureEventSystem();

			// Layout constants
			const float buttonSize = 140f;
			const float smallButtonSize = 100f;
			const float padding = 40f;
			const float gap = 26f;

			// D-Pad (bottom-left)
			var root = canvas.transform as RectTransform;
			CreateOnScreenButton(root, new Vector2(padding + buttonSize, padding + buttonSize + gap), new Vector2(buttonSize, buttonSize), "<Gamepad>/dpad/up", new Color(1f, 1f, 1f, 0.35f));
			CreateOnScreenButton(root, new Vector2(padding + buttonSize, padding), new Vector2(buttonSize, buttonSize), "<Gamepad>/dpad/down", new Color(1f, 1f, 1f, 0.35f));
			CreateOnScreenButton(root, new Vector2(padding, padding + buttonSize), new Vector2(buttonSize, buttonSize), "<Gamepad>/dpad/left", new Color(1f, 1f, 1f, 0.35f));
			CreateOnScreenButton(root, new Vector2(padding + buttonSize + gap + buttonSize, padding + buttonSize), new Vector2(buttonSize, buttonSize), "<Gamepad>/dpad/right", new Color(1f, 1f, 1f, 0.35f));

			// A/B (bottom-right)
			var screen = new Vector2(Screen.width, Screen.height);
			CreateOnScreenButtonAnchoredToBottomRight(root, new Vector2(padding + buttonSize + gap, padding + buttonSize * 0.5f), new Vector2(buttonSize, buttonSize), "<Gamepad>/buttonWest", new Color(0.3f, 0.9f, 0.3f, 0.5f)); // A
			CreateOnScreenButtonAnchoredToBottomRight(root, new Vector2(padding, padding), new Vector2(buttonSize, buttonSize), "<Gamepad>/buttonSouth", new Color(0.9f, 0.3f, 0.3f, 0.5f)); // B

			// Start/Select (top-right)
			CreateOnScreenButtonAnchoredToTopRight(root, new Vector2(padding + smallButtonSize + gap, padding), new Vector2(smallButtonSize, smallButtonSize * 0.7f), "<Gamepad>/start", new Color(1f, 1f, 1f, 0.35f));
			CreateOnScreenButtonAnchoredToTopRight(root, new Vector2(padding, padding), new Vector2(smallButtonSize, smallButtonSize * 0.7f), "<Gamepad>/select", new Color(1f, 1f, 1f, 0.35f));
		}

		private static void EnsureEventSystem()
		{
			var existing = Object.FindObjectOfType<EventSystem>();
			if (existing != null)
			{
				if (existing.gameObject.GetComponent<InputSystemUIInputModule>() == null)
				{
					existing.gameObject.AddComponent<InputSystemUIInputModule>();
				}
				return;
			}

			var esGo = new GameObject("EventSystem");
			Object.DontDestroyOnLoad(esGo);
			esGo.AddComponent<EventSystem>();
			esGo.AddComponent<InputSystemUIInputModule>();
		}

		private static void CreateOnScreenButton(RectTransform parent, Vector2 bottomLeftOffset, Vector2 size, string controlPath, Color color)
		{
			var go = new GameObject($"OnScreen_{Sanitize(controlPath)}");
			go.transform.SetParent(parent, false);

			var rect = go.AddComponent<RectTransform>();
			rect.anchorMin = new Vector2(0f, 0f);
			rect.anchorMax = new Vector2(0f, 0f);
			rect.pivot = new Vector2(0f, 0f);
			rect.sizeDelta = size;
			rect.anchoredPosition = bottomLeftOffset;

			var image = go.AddComponent<Image>();
			image.raycastTarget = true;
			image.color = color;

			var btn = go.AddComponent<OnScreenButton>();
			btn.controlPath = controlPath;
		}

		private static void CreateOnScreenButtonAnchoredToBottomRight(RectTransform parent, Vector2 bottomRightOffset, Vector2 size, string controlPath, Color color)
		{
			var go = new GameObject($"OnScreen_{Sanitize(controlPath)}");
			go.transform.SetParent(parent, false);

			var rect = go.AddComponent<RectTransform>();
			rect.anchorMin = new Vector2(1f, 0f);
			rect.anchorMax = new Vector2(1f, 0f);
			rect.pivot = new Vector2(1f, 0f);
			rect.sizeDelta = size;
			rect.anchoredPosition = new Vector2(-bottomRightOffset.x, bottomRightOffset.y);

			var image = go.AddComponent<Image>();
			image.raycastTarget = true;
			image.color = color;

			var btn = go.AddComponent<OnScreenButton>();
			btn.controlPath = controlPath;
		}

		private static void CreateOnScreenButtonAnchoredToTopRight(RectTransform parent, Vector2 topRightOffset, Vector2 size, string controlPath, Color color)
		{
			var go = new GameObject($"OnScreen_{Sanitize(controlPath)}");
			go.transform.SetParent(parent, false);

			var rect = go.AddComponent<RectTransform>();
			rect.anchorMin = new Vector2(1f, 1f);
			rect.anchorMax = new Vector2(1f, 1f);
			rect.pivot = new Vector2(1f, 1f);
			rect.sizeDelta = size;
			rect.anchoredPosition = new Vector2(-topRightOffset.x, -topRightOffset.y);

			var image = go.AddComponent<Image>();
			image.raycastTarget = true;
			image.color = color;

			var btn = go.AddComponent<OnScreenButton>();
			btn.controlPath = controlPath;
		}

		private static string Sanitize(string controlPath)
		{
			if (string.IsNullOrEmpty(controlPath))
			{
				return "Button";
			}
			return controlPath.Replace("<", "").Replace(">", "").Replace("/", "_");
		}
	}
}

