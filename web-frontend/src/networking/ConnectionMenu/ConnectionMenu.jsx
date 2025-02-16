import { useMemo } from "react";
import { FaPen } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../main/Button/Button";
import CheckboardBackground from "../../main/CheckboardBackground/CheckboardBackground";
import Header from "../../main/Header/Header";
import mainSlice from "../../main/mainSlice";
import ConnectionStatusModal from "../ConnectionStatusModal/ConnectionStatusModal";
import { useConnectToPeers } from "../useConnectToPeers";
import styles from "./ConnectionMenu.module.css";

const MAX_NAME_LENGTH = 50;

const ConnectionMenu = () => {
    const dispatch = useDispatch();
    const name = useSelector((state) => state.main.name);
    const isOnRequestCooldown = useSelector(
        (state) => state.main.isOnRequestCooldown,
    );
    const {
        players,
        requestMatch,
        acceptMatch,
        rejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
        broadcastNameChange,
    } = useConnectToPeers();
    const onClickEditName = () => {
        const newName = prompt("Name:");
        if (!newName) {
            return;
        }
        if (newName.length > MAX_NAME_LENGTH) {
            alert("Invalid name.");
        }
        dispatch(mainSlice.actions.setName(newName));
        broadcastNameChange(newName);
    };

    // Calculate title / button font-size
    const pageWidth = useSelector((state) => state.main.pageWidth);
    const fontSize = useMemo(() => {
        return Math.min(40, pageWidth / 12);
    }, [pageWidth]);

    return (
        <>
            <div className={styles.container}>
                <CheckboardBackground />
                <div className={styles.headerContainer}>
                    <Header />
                </div>
                <div className={styles.content}>
                    <div className={styles.title} style={{ fontSize }}>
                        Looking for players...
                    </div>
                    <div className={styles.yourNameContainer}>
                        <div className={styles.yourName}>
                            Your name: <b>{name}</b>
                        </div>
                        <FaPen
                            size={14}
                            onClick={onClickEditName}
                            className={styles.editName}
                        />
                    </div>
                    <div className={styles.players}>
                        {players.length === 0 && (
                            <div className={styles.noPlayers}>Searching...</div>
                        )}
                        {players.map((player) => {
                            const onClickPlayer = () => {
                                requestMatch(player.peerId);
                            };
                            return (
                                <Button
                                    key={player.peerId}
                                    className={styles.player}
                                    onClick={onClickPlayer}
                                    isDisabled={isOnRequestCooldown}
                                >
                                    {player.name}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <ConnectionStatusModal
                players={players}
                acceptMatch={acceptMatch}
                rejectMatch={rejectMatch}
                peerIdOfInboundReq={peerIdOfInboundReq}
                peerIdOfOutboundReq={peerIdOfOutboundReq}
            />
        </>
    );
};

export default ConnectionMenu;
