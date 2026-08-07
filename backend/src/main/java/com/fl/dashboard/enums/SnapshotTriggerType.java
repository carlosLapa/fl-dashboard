package com.fl.dashboard.enums;

/**
 * How a ProjetoMetricsSnapshot was created.
 * Only MANUAL is used for now; SCHEDULED is reserved for a future
 * periodic-snapshot job.
 */
public enum SnapshotTriggerType {
    MANUAL,
    SCHEDULED
}
