import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectShortcutMappings } from "./features/map/mapSlice";
import { usePlaybackCallbacks, useTtsState } from "./features/tts/TtsPlayer/hooks";

export function useShortcutMappingsEffect() {
  const shortcutMappings = useSelector(selectShortcutMappings);
  const {
    isPlaying
  } = useTtsState();
  const {
    togglePlaybackState,
    next
  } = usePlaybackCallbacks(isPlaying);

  useEffect(() => {
    let interval = null;
    if (shortcutMappings?.length > 0) {
      const mappingButtonStates = shortcutMappings.map(() => false);
      interval = setInterval(() => {
        const connectedGamepads = navigator.getGamepads?.() ?? [];
        shortcutMappings.forEach((mapping, idx) => {
          const buttonId = parseInt(mapping.buttonId);
          const gamepad = connectedGamepads.find(
            gamepad => gamepad?.id === mapping.gamepadId
          );
          if (gamepad && gamepad.buttons.length >= buttonId) {
            const pressed = gamepad.buttons[buttonId].pressed;
            if (pressed && !mappingButtonStates[idx]) {
              switch (mapping.action) {
                case "next":
                  next?.();
                  break;
                case "play":
                  togglePlaybackState?.();
                  break;
                default:
                  console.log("Unknown action", mapping.action);
                  break;
              }
            }
            mappingButtonStates[idx] = pressed;
          }
        });
      }, 100);
    }
    return () => {
      interval && clearInterval(interval);
    };
  }, [shortcutMappings, togglePlaybackState, next]);
}
