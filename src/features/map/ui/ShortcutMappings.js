import React, { useCallback } from 'react';

function ShortcutMapping({
  index, connectedGamepads, gamepadId, buttonId, action, removeShortcutMapping, changeShortcutMapping
}) {
  const onRemove = useCallback(() => {
    removeShortcutMapping(index);
  }, [removeShortcutMapping, index]);

  const onChangeGamepad = useCallback((e) => {
    const newGamepadId = e.target.value;
    changeShortcutMapping(index, {
      gamepadId: newGamepadId, buttonId, action
    });
  }, [changeShortcutMapping, index, buttonId, action]);

  const onChangeButton = useCallback((e) => {
    const newButtonId = e.target.value;
    changeShortcutMapping(index, {
      gamepadId, buttonId: newButtonId, action
    });
  }, [changeShortcutMapping, gamepadId, index, action]);

  const onChangeAction = useCallback((e) => {
    const newAction = e.target.value;
    changeShortcutMapping(index, {
      gamepadId, buttonId, action: newAction
    });
  }, [changeShortcutMapping, gamepadId, index, buttonId]);

  const gamepadSelect = (
    <select 
      id={`gamepadSelect_${index}`} 
      onChange={onChangeGamepad}
      value={gamepadId}>
      <option value="">(none)</option>
      {connectedGamepads.filter(g => g).map((gamepad, i) => 
        <option 
          key={i}
          value={gamepad ? gamepad.id : ''}
        >
          {gamepad ? gamepad.id : 'None'}
        </option>
      )}
      {gamepadId && !connectedGamepads.some(g => g.id === gamepadId) &&
        <option value={gamepadId}>{gamepadId}</option>
      }
    </select>
  );

  const gamepad = connectedGamepads?.find(g => g?.id === gamepadId);

  const buttonSelect = (
    <select
      id={`buttonSelect_${index}`}
      onChange={onChangeButton}
      value={buttonId}>
      <option value="">(none)</option>
      {gamepad && gamepad.buttons.map((button, i) =>
        <option key={i} value={`${i}`}>{`Button ${i + 1}`}</option>
      )}
      {!gamepad && buttonId &&
        <option value={buttonId}>{`Button ${parseInt(buttonId) + 1}`}</option>
      }
    </select>
  );

  const actionSelect = (
    <select
      id={`actionSelect_${index}`}
      onChange={onChangeAction}
      value={action}>
      <option value="">(none)</option>
      <option value="next">Skip to next article</option>
      <option value="play">Play/pause</option>
    </select>
  );

  return (
    <tr>
      <td>{gamepadSelect}</td>
      <td>{buttonSelect}</td>
      <td>{actionSelect}</td>
      <td><button type="button" onClick={onRemove}>Remove</button></td>
    </tr>
  );
}

export default function ShortcutMappings({
  connectedGamepads, shortcutMappings, changeShortcutMappings
}) {
  const addShortcutMapping = useCallback(() => {
    changeShortcutMappings([
      ...(shortcutMappings ?? []), 
      {
        gamepadId: '',
        buttonId: '',
        action: ''
      }
    ]);
  }, [changeShortcutMappings, shortcutMappings]);

  const removeShortcutMapping = useCallback((index) => {
    changeShortcutMappings(shortcutMappings.filter((_, i) => i !== index));
  }, [changeShortcutMappings, shortcutMappings]);

  const changeShortcutMapping = useCallback((index, mapping) => {
    changeShortcutMappings([
      ...shortcutMappings.slice(0, index),
      mapping,
      ...shortcutMappings.slice(index + 1)
    ]);
  }, [changeShortcutMappings, shortcutMappings]);

  return (
    <div>
      {!!shortcutMappings?.length && <table width="100%">
        <thead><tr><td>Gamepad</td><td>Button</td><td>Action</td><td></td></tr></thead>
        <tbody>
          {shortcutMappings.map(({ gamepadId, buttonId, action }, i) => 
            <ShortcutMapping
              key={i}
              index={i}
              removeShortcutMapping={removeShortcutMapping}
              changeShortcutMapping={changeShortcutMapping}
              connectedGamepads={connectedGamepads}
              gamepadId={gamepadId}
              buttonId={buttonId}
              action={action}
            />
          )}
        </tbody>
      </table>}
      <button type="button" onClick={addShortcutMapping}>Add gamepad shortcut mapping</button>
    </div>
  );
}
