import _ from "lodash";
import Modal from "../../chess/Modal/Modal";
import styles from "./ConnectionStatusModal.module.css";

const ConnectionStatusModal = ({
    players,
    confirmMatch,
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
                    <div
                        className={styles.button}
                        onClick={() => confirmMatch(peerIdOfInboundReq)}
                    >
                        Accept
                    </div>
                    <div
                        className={styles.button}
                        onClick={() => rejectMatch(peerIdOfInboundReq)}
                    >
                        Reject
                    </div>
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
