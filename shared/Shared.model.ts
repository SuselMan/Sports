export enum Muscles {
    Neck = "Neck",
    Feet = "Feet",
    UpperTrapezius = "UpperTrapezius",
    Gastrocnemius = "Gastrocnemius",
    Soleus = "Soleus",
    LateralDeltoid = "LateralDeltoid",
    InnerThigh = "InnerThigh",
    WristExtensors = "WristExtensors",
    WristFlexors = "WristFlexors",
    Hands = "Hands",
    Groin = "Groin",
    Tibialis = "Tibialis",
    OuterQuadricep = "OuterQuadricep",
    RectusFemoris = "RectusFemoris",
    InnerQuadricep = "InnerQuadricep",
    LongHeadBicep = "LongHeadBicep",
    ShortHeadBicep = "ShortHeadBicep",
    Obliques = "Obliques",
    LowerAbdominals = "LowerAbdominals",
    UpperAbdominals = "UpperAbdominals",
    MidLowerPectoralis = "MidLowerPectoralis",
    UpperPectoralis = "UpperPectoralis",
    AnteriorDeltoid = "AnteriorDeltoid",
    MedialHamstrings = "MedialHamstrings",
    LateralHamstrings = "LateralHamstrings",
    GluteusMaximus = "GluteusMaximus",
    GluteusMedius = "GluteusMedius",
    LowerBack = "LowerBack",
    Lats = "Lats",
    MedialHeadTriceps = "MedialHeadTriceps",
    LongHeadTriceps = "LongHeadTriceps",
    LateralHeadTriceps = "LateralHeadTriceps",
    PosteriorDeltoid = "PosteriorDeltoid",
    LowerTrapezius = "LowerTrapezius",
    TrapsMiddle = "TrapsMiddle",
}

type MuscleMapIds = {
    front? : string,
    back? : string,
}

export const muscleIdMap: Record<Muscles, any> = {
    // both
    Neck:                 { front: '#neck', back: '#neck' },
    Feet:                 { front: '#feet', back: '#feet' },
    UpperTrapezius:       { front: '#upper-trapezius', back: '#upper-trapezius' },
    Gastrocnemius:        { front: '#gastrocnemius', back: '#gastrocnemius' },
    Soleus:               { front: '#soleus', back: '#soleus' },
    LateralDeltoid:       { front: '#lateral-deltoid', back: '#lateral-deltoid' },
    InnerThigh:           { front: '#inner-thigh', back: '#inner-thigh' },
    WristExtensors:       { front: '#wrist-extensors', back: '#wrist-extensors' },
    WristFlexors:         { front: '#wrist-flexors', back: '#wrist-flexors' },
    Hands:                { front: '#hands', back: '#hands' },

    // front
    Groin:                { front: '#groin' },
    Tibialis:             { front: '#tibialis' },
    OuterQuadricep:       { front: '#outer-quadricep' },
    RectusFemoris:        { front: '#rectus-femoris' },
    InnerQuadricep:       { front: '#inner-quadricep' },
    LongHeadBicep:        { front: '#long-head-bicep' },
    ShortHeadBicep:       { front: '#short-head-bicep' },
    Obliques:             { front: '#obliques' },
    LowerAbdominals:      { front: '#lower-abdominals' },
    UpperAbdominals:      { front: '#upper-abdominals' },
    MidLowerPectoralis:   { front: '#mid-lower-pectoralis' },
    UpperPectoralis:      { front: '#upper-pectoralis' },
    AnteriorDeltoid:      { front: '#anterior-deltoid' },

    // back
    MedialHamstrings:     { back: '#medial-hamstrings' },
    LateralHamstrings:    { back: '#lateral-hamstrings' },
    GluteusMaximus:       { back: '#gluteus-maximus' },
    GluteusMedius:        { back: '#gluteus-medius' },
    LowerBack:            { back: '#lowerback' },
    Lats:                 { back: '#lats' },
    MedialHeadTriceps:    { back: '#medial-head-triceps' },
    LongHeadTriceps:      { back: '#long-head-triceps' },
    LateralHeadTriceps:   { back: '#lateral-head-triceps' },
    PosteriorDeltoid:     { back: '#posterior-deltoid' },
    LowerTrapezius:       { back: '#lower-trapezius' },
    TrapsMiddle:          { back: '#traps-middle' },
};

export type ISODateString = string; // ISO 8601, e.g. "2025-11-10T10:00:00Z"

// Shared sync metadata for offline-first (soft-delete + incremental sync)
export type SyncMetaData = {
  archived?: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
};

export type PaginationRequestData = {
  pageSize: number, //integer;
  page: number, //integer; 1-based
  sortBy?: 'date' | 'name',
  sortOrder?: 'asc' | 'desc',
}

export type PaginationResponseData = {
  pageSize: number, //integer;
  page: number, //integer,
  total: number,
}