const Participants = ({ participants, highlightedParticipant }) => {
  return (
    <div>
      <p className="mb-2">Event Participants</p>
      {participants && participants.length > 0 ? (
        <div className="flex flex-col gap-2">
          {participants.map((participant) => {
            const { UserID: id, Name: name } = participant;
            const isHighlighted =
              highlightedParticipant && highlightedParticipant.includes(id);
            const isDimmed =
              highlightedParticipant && !highlightedParticipant.includes(id);

            return (
              <div
                key={`${name}${id}`}
                className={`flex items-center gap-2 transition-all ${
                  isHighlighted ? "my-1 scale-105" : ""
                }`}
              >
                <div className="avatar avatar-placeholder">
                  <div
                    className={`w-8 rounded-full ${isHighlighted ? "ring-primary ring-2 ring-offset-1" : ""} ${isDimmed ? "bg-gray-300 text-gray-500" : "bg-primary text-neutral-content"}`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div
                  className={`text-sm ${isHighlighted ? "text-primary" : ""} ${isDimmed ? "text-gray-400 line-through" : ""}`}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No participants yet.</p>
      )}
    </div>
  );
};

export default Participants;
