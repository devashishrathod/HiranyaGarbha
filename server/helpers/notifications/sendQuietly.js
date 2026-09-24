/**
 * Send a notice without letting it undo the thing it is announcing.
 *
 * ⚠️ An appointment that was booked, a payment that was verified, a
 * subscription that went live — none of those may be rolled back because a
 * push token had expired or Gmail was slow. The operation has already
 * happened; throwing here would unwind a completed action over a delivery
 * failure.
 *
 * `notify()` already swallows its own errors. This exists for the layer above
 * it: a notice helper that builds its message from an appointment can still
 * throw on a missing field, and that must not reach the booking either.
 *
 * A lost notice is logged loudly and the business operation stands.
 *
 * ```js
 * await sendQuietly(
 *   () => notifyAppointmentBooked(appointment),
 *   "appointment booked notice",
 * );
 * ```
 */
exports.sendQuietly = async (send, context = "notification") => {
  try {
    return await send();
  } catch (error) {
    console.error(`[notify] ${context} failed:`, error?.message);
    return null;
  }
};
