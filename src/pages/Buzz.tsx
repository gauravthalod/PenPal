import { useState } from "react";
import DMList from "@/components/DMList";
import GroupChat from "@/components/GroupChat";
import DMChat from "@/components/DMChat";

// Mock DM data to get user info
const mockDMData = {
  "1": { username: "anon_47", college: "CMREC", isOnline: true },
  "2": { username: "anon_99", college: "CMRIT", isOnline: true },
  "3": { username: "anon_12", college: "CMRTC", isOnline: false },
  "4": { username: "anon_88", college: "CMRCET", isOnline: false },
  "5": { username: "anon_55", college: "CMREC", isOnline: true }
};

const Buzz = () => {
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [showDMList, setShowDMList] = useState(false);

  const handleBackToDMList = () => {
    setSelectedDM(null);
  };

  const handleBackToGroup = () => {
    setSelectedDM(null);
  };

  const selectedDMData = selectedDM ? mockDMData[selectedDM as keyof typeof mockDMData] : null;

  return (
    <>
      {/* Mobile Layout */}
      <div className="block sm:hidden h-[calc(100vh-120px)]">
        {selectedDM && selectedDMData ? (
          <DMChat
            dmId={selectedDM}
            username={selectedDMData.username}
            college={selectedDMData.college}
            isOnline={selectedDMData.isOnline}
            onBack={handleBackToDMList}
            onBackToGroup={handleBackToGroup}
          />
        ) : showDMList ? (
          <DMList
            selectedDM={selectedDM}
            onSelectDM={(dm) => {
              setSelectedDM(dm);
              setShowDMList(false);
            }}
          />
        ) : (
          <GroupChat onShowDMList={() => setShowDMList(true)} />
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid grid-cols-12 gap-4 lg:gap-6 h-[calc(100vh-200px)]">
        {/* Left Column - DMs */}
        <div className="col-span-5 lg:col-span-4">
          <DMList
            selectedDM={selectedDM}
            onSelectDM={setSelectedDM}
          />
        </div>

        {/* Right Column - DM Chat or Group Chat */}
        <div className="col-span-7 lg:col-span-8">
          {selectedDM && selectedDMData ? (
            <DMChat
              dmId={selectedDM}
              username={selectedDMData.username}
              college={selectedDMData.college}
              isOnline={selectedDMData.isOnline}
              onBack={handleBackToDMList}
              onBackToGroup={handleBackToGroup}
            />
          ) : (
            <GroupChat />
          )}
        </div>
      </div>
    </>
  );
};

export default Buzz;
