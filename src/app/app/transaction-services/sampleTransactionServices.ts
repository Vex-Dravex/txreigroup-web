import { VendorListing } from "../contractors/types";

export const exampleTransactionServices: VendorListing[] = [
    {
        id: "d8224455-1f93-4173-9622-89012345f6f1",
        name: "Bayou Title Partners",
        tagline: "Investor-first title team with fast turn commitments",
        description:
            "Investor-focused title searches, mobile notary coordination, and weekly closing windows for high-volume portfolios.",
        location: "Houston, TX",
        marketAreas: ["Houston", "Coastal Texas"],
        workTypes: ["Title Company"],
        verificationStatus: "verified",
        contact: {
            name: "Alyssa Kim",
            phone: "(713) 555-0145",
            email: "investors@bayoutitle.com",
            website: "https://bayoutitle.com",
        },
        logoUrl: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=200&q=80",
        pastProjects: [
            {
                title: "20-door portfolio closings",
                location: "Houston Metro",
                budget: "$1.3M",
                referenceName: "Harbor Lane Capital",
                description: "Handled sequential cash-out refis and coordinated title curatives across five counties.",
            },
        ],
    },
    {
        id: "a9335566-2e84-4284-9733-90123456a7a2",
        name: "Lone Star Escrow Co.",
        tagline: "Escrow officers who keep assignment deals moving",
        description:
            "Experienced in wholesale assignments, double closes, and investor-friendly escrow workflows with transparent timelines.",
        location: "Dallas, TX",
        marketAreas: ["Dallas-Fort Worth", "Austin"],
        workTypes: ["Escrow Officer"],
        verificationStatus: "verified",
        contact: {
            name: "Derrick Fuentes",
            phone: "(214) 555-0179",
            email: "derick@lsescrow.com",
            website: "https://lsescrow.com",
        },
        logoUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=200&q=80",
        pastProjects: [
            {
                title: "Assignment-friendly closings",
                location: "DFW Metroplex",
                budget: "$620k",
                referenceName: "Peak Wholesale Group",
                description: "Coordinated simultaneous closes for 12 wholesale assignments in under 60 days.",
            },
        ],
    },
    {
        id: "c0446677-3d75-4395-9844-01234567b8b3",
        name: "Cedar Capital Private Money",
        tagline: "Fast approvals for buy-and-hold investors",
        description:
            "Bridge and private money options for acquisitions, rehab, and portfolio refinances with 48-hour term sheets.",
        location: "Austin, TX",
        marketAreas: ["Austin", "Texas Hill Country", "San Antonio"],
        workTypes: ["Private Money Lender"],
        verificationStatus: "verified",
        contact: {
            name: "Monica Perez",
            phone: "(512) 555-0122",
            email: "monica@cedarcapital.com",
            website: "https://cedarcapital.com",
        },
        logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=200&q=80",
        pastProjects: [
            {
                title: "Bridge lending for STR renovation",
                location: "Fredericksburg, TX",
                budget: "$410k",
                referenceName: "Vista REI Holdings",
                description: "Funded in 10 days with rehab draws structured for short-term rental timelines.",
            },
        ],
    },
    {
        id: "e1557788-4c66-4406-9955-12345678c9c4",
        name: "Sunset Gator Buyers",
        tagline: "Close-ready cash buyers across Texas metros",
        description:
            "Cash buyer network with clear criteria, quick inspections, and reliable closing timelines for wholesalers.",
        location: "San Antonio, TX",
        marketAreas: ["San Antonio", "Austin", "Houston"],
        workTypes: ["Gator"],
        verificationStatus: "pending",
        contact: {
            name: "Bryce Alvarado",
            phone: "(210) 555-0199",
            email: "acquisitions@sunsetgator.com",
        },
        logoUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=200&q=80",
        pastProjects: [
            {
                title: "Wholesale disposition pipeline",
                location: "San Antonio",
                referenceName: "Main Street Wholesale",
                description: "Consistently purchased 4-6 deals monthly with 10-day average close.",
            },
        ],
    },
    {
        id: "f2668899-5b57-4517-1066-23456789d0d5",
        name: "Bluebonnet Transaction Ops",
        tagline: "Coordinators who manage docs and deadlines",
        description:
            "Transaction coordinators who keep rehab and wholesale paperwork on track with weekly status updates.",
        location: "Dallas, TX",
        marketAreas: ["Dallas-Fort Worth", "Houston"],
        workTypes: ["Transaction Coordinator"],
        verificationStatus: "verified",
        contact: {
            name: "Leah Porter",
            phone: "(972) 555-0107",
            email: "leah@bbtxops.com",
            website: "https://bbtxops.com",
        },
        logoUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=200&q=80",
        pastProjects: [
            {
                title: "Multi-deal closing coordination",
                location: "Dallas Metro",
                budget: "$980k",
                referenceName: "BrightPath Investments",
                description: "Managed 18 closings across 4 title companies with shared checklists.",
            },
        ],
    },
];
