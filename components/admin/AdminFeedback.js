export default function AdminFeedback({ errorMessage, statusMessage }) {
  return (
    <>
      {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
    </>
  );
}
