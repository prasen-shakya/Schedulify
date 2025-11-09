const Participants = ({ participants }) => {
  return (
    <div>
      <p className="mb-2">Event Participants</p>
      {participants && participants.length > 0 ? (
        <div className="flex flex-col gap-2">
          {participants.map((participant) => {
            const { UserId: id, Name: name } = participant;
            return (
              <div key={`${name}${id}`} className="flex items-center gap-2">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-neutral-content w-8 rounded-full">
                    {name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-sm">
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
