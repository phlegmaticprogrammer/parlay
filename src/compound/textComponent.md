# TextComponent Considerations

## How should the component react when the model completes?

It seems it should make the textnode uneditable. 

## How should the component react when a change, originating from the user, is rejected by the model?

The problem here is that often, the user interface will already be reflecting the user change.
Furthermore, the information that the update was rejected may come with a delay,
interfering with other user changes and model updates since then. 

## Solution: UniformUpdateModel

Sets dirty flag before calling model.update.

