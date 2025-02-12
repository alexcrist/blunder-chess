import _ from "lodash";
import Modal from "../../chess/Modal/Modal";
import Button from "../../main/Button/Button";
import styles from "./ConnectionStatusModal.module.css";

const ConnectionStatusModal = ({
    players,
    acceptMatch,
    rejectMatch,
    peerIdOfInboundReq,
    peerIdOfOutboundReq,
}) => {
    const isVisible = peerIdOfInboundReq || peerIdOfOutboundReq;
    let content;
    if (peerIdOfInboundReq) {
        const peerName = _.find(players, { peerId: peerIdOfInboundReq })?.name;
        content = (
            <>
                <div className={styles.title}>
                    Incoming game request from {peerName}!
                </div>
                <div className={styles.buttons}>
                    <Button
                        className={styles.button}
                        onClick={() => acceptMatch(peerIdOfInboundReq)}
                    >
                        Accept
                    </Button>
                    <Button
                        className={styles.button}
                        onClick={() => rejectMatch(peerIdOfInboundReq)}
                    >
                        Reject
                    </Button>
                </div>
            </>
        );
    } else if (peerIdOfOutboundReq) {
        const peerName = _.find(players, { peerId: peerIdOfOutboundReq })?.name;
        content = (
            <>
                <div className={styles.title}>
                    Game request sent to {peerName}...
                </div>
                <div className={styles.buttons}>
                    <Button
                        className={styles.button}
                        onClick={() => rejectMatch(peerIdOfOutboundReq)}
                    >
                        Cancel
                    </Button>
                </div>
            </>
        );
    }

    return (
        <Modal className={styles.container} isVisible={isVisible}>
            {content}
        </Modal>
    );
};

export default ConnectionStatusModal;
