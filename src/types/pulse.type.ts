/**
 *  Pulse event types and interfaces
 *  Pulse events are used for real-time communication in the application.
 *  They allow different parts of the application to communicate with each other
 *  in a decoupled manner.
 *  This file defines the types and interfaces for pulse events.
 *  It includes the event names, the function signature for event handlers,
 *  and the structure of event listeners.
 */
export type PulseEventFN = (args: Record<string, any>) => void;
/**
 *  PulseEventListener defines a listener for pulse events.
 *  It includes the event name and the function to be called when the event is triggered.
 *  The function takes an argument of type Record<string, any>, which allows for flexibility
 *  in the data passed to the event handler.
 *  This structure allows for easy addition of new events and handlers without changing the core logic.
 */
export type PulseEventListener = {
  event: string;
  fn: PulseEventFN;
};
/**
 *  PulseEvent interface defines the structure of a pulse event.
 *  It includes the event name, the data associated with the event,
 *  and the sender ID.
 *  This structure allows for easy identification of the event and the data it carries,
 *   which is essential for processing the event correctly.
 */
export interface PulseEvent {
  event: string;
  data: Record<string, any>;
  sender_id: string;
}
