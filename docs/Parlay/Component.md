A *component* is responsible for displaying and editing some part of a *model*. 
A component may, or may not be *content-editable*, and it may, or may not be a *child* of a content-editable *parent* component.

## Model
Let us first clarify what a model is. For our purposes here, a model is an interface to some data: there are capabilities for both reading and writing to a model. 

For reading from a model, reactive programming seems to be a good choice: Each relevant property of the model is exposed as a *stream* or *observable*

Should a model be *reactive*??

