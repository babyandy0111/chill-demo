import React, { memo } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { useAppStore } from '../store.js';
import { playClickSound } from '../audioPlayer.js';

const styles = {
    container: {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '280px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100, // Ensure it's above other UI elements
        overflow: 'hidden',
        fontFamily: 'system-ui, sans-serif',
    },
    closeButton: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: '#9CA3AF',
        cursor: 'pointer',
        padding: '4px',
        lineHeight: '1',
        zIndex: 11,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        gap: '12px',
    },
    flag: {
        width: '32px',
        height: '24px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    location: {
        display: 'flex',
        flexDirection: 'column',
    },
    country: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1F2937',
    },
    region: {
        fontSize: '14px',
        color: '#6B7280',
    },
    coordinates: {
        fontSize: '12px',
        color: '#9CA3AF',
        marginTop: '2px',
    },
    body: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    text: {
        fontSize: '15px',
        color: '#374151',
        margin: 0,
    },
    claimButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#3B82F6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background-color 0.2s',
    },
    cloudIcon: {
        fontSize: '20px',
    },
    loader: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3B82F6',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
    },
    // Keyframes for loader animation (if not already global)
    // @keyframes spin {
    //   0% { transform: rotate(0deg); }
    //   100% { transform: rotate(360deg); }
    // }
};

const CellInfoWindow = ({ cellInfo, onClaim, onClose, isClaimDisabled }) => {

    const { countryName, regionName, flagUrl, isLoading } = cellInfo;

    const clouds = useAppStore((state) => state.clouds); // Re-add clouds state retrieval



    const handleClaimClick = (e) => {

        e.stopPropagation();

        playClickSound();

        onClaim();

    };

    

    const handleCloseClick = (e) => {

        e.stopPropagation();

        playClickSound();

        onClose();

    };



    return (

        <div style={styles.container} onClick={(e) => e.stopPropagation()}>

            <button style={styles.closeButton} onClick={handleCloseClick}>&times;</button>

            <div style={styles.header}>

                {isLoading ? (

                    <div style={styles.loader}></div>

                ) : (

                    <>

                        {flagUrl && <img src={flagUrl} alt="Flag" style={styles.flag} />}

                        <div style={styles.location}>

                            <span style={styles.country}>{countryName}</span>

                            <span style={styles.region}>{regionName}</span>

                            <span style={styles.coordinates}>{cellInfo.position.lat.toFixed(4)}, {cellInfo.position.lng.toFixed(4)}</span>

                        </div>

                    </>

                )}

            </div>

            <div style={styles.body}>

                <p style={styles.text}>

                    Do you want to claim this area?

                </p>

                <button

                    style={styles.claimButton}

                    onClick={handleClaimClick}

                    disabled={isClaimDisabled}

                >

                    <span style={styles.cloudIcon}>☁️</span>

                    Claim

                </button>

            </div>

        </div>

    );

};

export default memo(CellInfoWindow);
