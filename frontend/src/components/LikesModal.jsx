import React from 'react';

export default function LikesModal({ isOpen, onClose, likedBy }) {
    if (!isOpen) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content" style={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)' }}>
                    <div className="modal-header border-0 pb-0">
                        <ul className="nav nav-tabs border-0" style={{ width: '100%' }}>
                            <li className="nav-item">
                                <a className="nav-link active border-0" href="#" style={{ color: '#1877F2', borderBottom: '3px solid #1877F2', padding: '10px 16px', fontWeight: 600 }}>All</a>
                            </li>
                        </ul>
                        <button
                            type="button"
                            className="btn-close position-absolute"
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                top: '15px',
                                right: '15px',
                                backgroundColor: '#E4E6EB',
                                borderRadius: '50%',
                                padding: '10px',
                                opacity: 1,
                                backgroundSize: '12px'
                            }}
                        ></button>
                    </div>
                    <div className="modal-body pt-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {likedBy.length === 0 ? (
                            <p className="text-center text-muted mt-3">No reactions yet.</p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {likedBy.map((user) => (
                                    <li key={user.id} className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-2">
                                        <div className="d-flex align-items-center">
                                            <div className="position-relative">
                                                <img
                                                    src="/assets/images/profile.png"
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="rounded-circle"
                                                    width="40"
                                                    height="40"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <div className="position-absolute" style={{ bottom: '-2px', right: '-2px' }}>
                                                    <img src="/assets/images/react_img1.png" width="16" height="16" alt="Reaction" className="rounded-circle border border-white" />
                                                </div>
                                            </div>
                                            <div className="ms-3">
                                                <h6 className="mb-0" style={{ fontSize: '15px', fontWeight: 600 }}>{user.firstName} {user.lastName}</h6>
                                                <small className="text-muted">1 mutual friend</small>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}






