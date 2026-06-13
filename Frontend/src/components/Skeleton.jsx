import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  useMediaQuery,
} from "@mui/material";

const safeContainerSx = {
  width: "100%",
  maxWidth: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
};

const cardSafeSx = {
  ...safeContainerSx,
  height: "100%",
  borderRadius: "24px",
  background: "var(--app-glass)",
  border: "1px solid var(--app-border)",
  boxShadow: "var(--app-shadow)",
};

const panelSafeSx = {
  ...safeContainerSx,
  borderRadius: "28px",
  background: "var(--app-glass-strong)",
  border: "1px solid var(--app-border-strong)",
  boxShadow: "var(--app-shadow-strong)",
};

const shimmerSx = {
  transform: "translateZ(0)",
  "&::after": {
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
  },
};

const srOnlySx = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  border: 0,
};

const PremiumSkeleton = memo(function PremiumSkeleton({ sx, ...props }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <Skeleton
      variant="rounded"
      animation={reducedMotion ? false : "wave"}
      sx={[shimmerSx, sx]}
      {...props}
    />
  );
});

export const StatsCardSkeleton = memo(function StatsCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <PremiumSkeleton width="48%" height={18} />
          <PremiumSkeleton width={40} height={40} sx={{ borderRadius: 3 }} />
        </Stack>
        <PremiumSkeleton width="36%" height={44} sx={{ mt: 2 }} />
        <PremiumSkeleton width="44%" height={16} sx={{ mt: 1.25 }} />
      </CardContent>
    </Card>
  );
});

export const ProfileCardSkeleton = memo(function ProfileCardSkeleton() {
  return (
    <Card className="dashboard-profile-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box sx={{ width: "65%" }}>
            <PremiumSkeleton width="40%" height={14} />
            <PremiumSkeleton width="85%" height={30} sx={{ mt: 1 }} />
          </Box>
          <PremiumSkeleton
            width={56}
            height={56}
            sx={{ borderRadius: "18px" }}
          />
        </Stack>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          }}
        >
          <Card className="glass-card" elevation={0} sx={cardSafeSx}>
            <CardContent sx={{ p: 1.5 }}>
              <PremiumSkeleton width="60%" height={14} />
              <PremiumSkeleton width="90%" height={20} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card className="glass-card" elevation={0} sx={cardSafeSx}>
            <CardContent sx={{ p: 1.5 }}>
              <PremiumSkeleton width="52%" height={14} />
              <PremiumSkeleton width="88%" height={20} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
          <PremiumSkeleton width={72} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={84} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={66} height={24} sx={{ borderRadius: 99 }} />
        </Stack>

        <PremiumSkeleton
          width="100%"
          height={44}
          sx={{ mt: 3, borderRadius: 999 }}
        />
      </CardContent>
    </Card>
  );
});

export const JobCardSkeleton = memo(function JobCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <PremiumSkeleton width={40} height={40} sx={{ borderRadius: 2 }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <PremiumSkeleton width="60%" height={24} />
            <PremiumSkeleton width="42%" height={16} sx={{ mt: 0.75 }} />
          </Box>
        </Stack>

        <PremiumSkeleton width="90%" height={14} sx={{ mt: 2 }} />
        <PremiumSkeleton width="72%" height={14} sx={{ mt: 1 }} />

        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
          <PremiumSkeleton width={66} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={72} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={58} height={24} sx={{ borderRadius: 99 }} />
        </Stack>

        <PremiumSkeleton
          width="44%"
          height={36}
          sx={{ mt: 2.5, borderRadius: 99 }}
        />
      </CardContent>
    </Card>
  );
});

export const ActivityCardSkeleton = memo(function ActivityCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ width: "70%" }}>
            <PremiumSkeleton width="35%" height={12} />
            <PremiumSkeleton width="78%" height={22} sx={{ mt: 0.8 }} />
            <PremiumSkeleton width="52%" height={16} sx={{ mt: 0.8 }} />
          </Box>
          <PremiumSkeleton width={90} height={24} sx={{ borderRadius: 99 }} />
        </Stack>
        <PremiumSkeleton width="42%" height={14} sx={{ mt: 1.5 }} />
      </CardContent>
    </Card>
  );
});

export const TableRowSkeleton = memo(function TableRowSkeleton() {
  return (
    <Box
      sx={{
        ...safeContainerSx,
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1fr auto",
        gap: 2,
        alignItems: "center",
        p: 2,
        borderRadius: "14px",
        border: "1px solid var(--app-border)",
      }}
      aria-hidden="true"
    >
      <PremiumSkeleton width="68%" height={18} />
      <PremiumSkeleton width="80%" height={16} />
      <PremiumSkeleton width="72%" height={16} />
      <PremiumSkeleton width={96} height={30} sx={{ borderRadius: 99 }} />
    </Box>
  );
});

function HeroSkeleton({ ctaCount = 2 }) {
  return (
    <Box className="dashboard-hero" sx={{ ...safeContainerSx, p: 3 }}>
      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1.35fr 0.65fr" },
        }}
      >
        <Stack spacing={1.25} sx={{ minWidth: 0, height: "100%" }}>
          <PremiumSkeleton width="22%" height={14} />
          <PremiumSkeleton width="68%" height={54} />
          <PremiumSkeleton width="88%" height={18} />
          <PremiumSkeleton width="62%" height={18} />
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 2, flexWrap: "wrap" }}
          >
            {Array.from({ length: ctaCount }).map((_, index) => (
              <PremiumSkeleton
                key={index}
                width={index === 0 ? 142 : 170}
                height={42}
                sx={{ borderRadius: 99 }}
              />
            ))}
          </Stack>
        </Stack>

        <ProfileCardSkeleton />
      </Box>
    </Box>
  );
}

export const TalentDashboardSkeleton = memo(function TalentDashboardSkeleton() {
  return (
    <Box
      className="page-enter"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading talent dashboard"
      sx={{ ...safeContainerSx, display: "grid", gap: 4 }}
    >
      <HeroSkeleton ctaCount={3} />

      {/* Stats row — matches grid-cols-2 lg:grid-cols-4 */}
      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </Box>

      {/* Main content — matches xl:grid-cols-[0.9fr_1.1fr] */}
      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "0.9fr 1.1fr" },
        }}
      >
        <Card
          className="glass-panel"
          elevation={0}
          sx={{ ...panelSafeSx, p: 3 }}
        >
          <PremiumSkeleton width="28%" height={14} />
          <PremiumSkeleton width="52%" height={32} sx={{ mt: 1 }} />
          <Stack spacing={1.5} sx={{ mt: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <ActivityCardSkeleton key={index} />
            ))}
          </Stack>
        </Card>

        <Card
          className="glass-panel"
          elevation={0}
          sx={{ ...panelSafeSx, p: 3 }}
        >
          <PremiumSkeleton width="22%" height={14} />
          <PremiumSkeleton width="40%" height={32} sx={{ mt: 1 }} />
          <Box
            sx={{
              ...safeContainerSx,
              mt: 2,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </Box>
        </Card>
      </Box>

      <Box component="span" sx={srOnlySx}>
        Loading dashboard content
      </Box>
    </Box>
  );
});

export const CompanyDashboardSkeleton = memo(
  function CompanyDashboardSkeleton() {
    return (
      <Box
        className="page-enter"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading company dashboard"
        sx={{ ...safeContainerSx, display: "grid", gap: 4 }}
      >
        <HeroSkeleton ctaCount={2} />

        {/* Stats row — matches grid-cols-2 lg:grid-cols-5 */}
        <Box
          sx={{
            ...safeContainerSx,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
          }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </Box>

        {/* Main content — matches xl:grid-cols-[minmax(0,1fr)_24rem] */}
        <Box
          sx={{
            ...safeContainerSx,
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 24rem" },
          }}
        >
          <Card
            className="glass-panel"
            elevation={0}
            sx={{ ...panelSafeSx, p: 3 }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between" }}
            >
              <Box sx={{ width: { xs: "100%", lg: "45%" } }}>
                <PremiumSkeleton width="26%" height={14} />
                <PremiumSkeleton width="62%" height={30} sx={{ mt: 1 }} />
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <PremiumSkeleton
                  width={66}
                  height={32}
                  sx={{ borderRadius: 99 }}
                />
                <PremiumSkeleton
                  width={68}
                  height={32}
                  sx={{ borderRadius: 99 }}
                />
                <PremiumSkeleton
                  width={76}
                  height={32}
                  sx={{ borderRadius: 99 }}
                />
              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </Stack>
          </Card>

          <Stack spacing={3}>
            <Card
              className="glass-panel"
              elevation={0}
              sx={{ ...panelSafeSx, p: 3 }}
            >
              <PremiumSkeleton width="34%" height={14} />
              <PremiumSkeleton width="56%" height={28} sx={{ mt: 1 }} />
              <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ActivityCardSkeleton key={index} />
                ))}
              </Stack>
            </Card>

            <Card
              className="dashboard-hero"
              elevation={0}
              sx={{ ...safeContainerSx, p: 3, borderRadius: "28px" }}
            >
              <PremiumSkeleton
                width={48}
                height={48}
                sx={{ borderRadius: 2.5 }}
              />
              <PremiumSkeleton width="54%" height={30} sx={{ mt: 2 }} />
              <PremiumSkeleton width="94%" height={16} sx={{ mt: 1 }} />
              <PremiumSkeleton width="80%" height={16} sx={{ mt: 0.8 }} />
              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                <PremiumSkeleton
                  width="48%"
                  height={40}
                  sx={{ borderRadius: 99 }}
                />
                <PremiumSkeleton
                  width="48%"
                  height={40}
                  sx={{ borderRadius: 99 }}
                />
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Box>
    );
  },
);

export const CompanyJobsSkeleton = memo(function CompanyJobsSkeleton() {
  return (
    <Box
      className="page-enter"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading jobs dashboard"
      sx={{ ...safeContainerSx, display: "grid", gap: 4 }}
    >
      {/* Page header */}
      <Box sx={{ ...safeContainerSx }}>
        <PremiumSkeleton width="18%" height={14} />
        <PremiumSkeleton width="28%" height={48} sx={{ mt: 1 }} />
        <PremiumSkeleton width="64%" height={16} sx={{ mt: 1.2 }} />
      </Box>

      {/* Stats row — matches grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 */}
      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </Box>

      {/* Main content — matches xl:grid-cols-[1.1fr_0.9fr] */}
      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "1.1fr 0.9fr" },
        }}
      >
        <Card
          className="glass-card"
          elevation={0}
          sx={{ ...cardSafeSx, p: 3 }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Box sx={{ width: { xs: "100%", lg: "40%" } }}>
              <PremiumSkeleton width="30%" height={14} />
              <PremiumSkeleton width="82%" height={28} sx={{ mt: 1 }} />
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <PremiumSkeleton
                width={62}
                height={30}
                sx={{ borderRadius: 99 }}
              />
              <PremiumSkeleton
                width={62}
                height={30}
                sx={{ borderRadius: 99 }}
              />
              <PremiumSkeleton
                width={62}
                height={30}
                sx={{ borderRadius: 99 }}
              />
            </Stack>
          </Stack>

          <Stack spacing={1.5} sx={{ mt: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </Stack>
        </Card>

        <Stack spacing={3}>
          <Card
            className="glass-card"
            elevation={0}
            sx={{ ...cardSafeSx, p: 3 }}
          >
            <PremiumSkeleton width="46%" height={30} />
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </Stack>
          </Card>

          <Card
            className="glass-card"
            elevation={0}
            sx={{ ...cardSafeSx, p: 3 }}
          >
            <PremiumSkeleton width="38%" height={30} />
            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
              <PremiumSkeleton
                width="100%"
                height={50}
                sx={{ borderRadius: 3 }}
              />
              <PremiumSkeleton
                width="100%"
                height={50}
                sx={{ borderRadius: 3 }}
              />
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
});

/* ─── Job Listing Card Skeleton (reused in lists) ──────────────────────── */
const JobListingCardSkeleton = memo(function JobListingCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", lg: "row" },
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <PremiumSkeleton
            width={56}
            height={56}
            sx={{ borderRadius: "16px", flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <PremiumSkeleton
                width={60}
                height={20}
                sx={{ borderRadius: 99 }}
              />
              <PremiumSkeleton
                width={72}
                height={20}
                sx={{ borderRadius: 99 }}
              />
            </Stack>
            <PremiumSkeleton width="55%" height={24} />
            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
              <PremiumSkeleton width="18%" height={16} />
              <PremiumSkeleton width="14%" height={16} />
              <PremiumSkeleton width="20%" height={16} />
            </Stack>
            <PremiumSkeleton width="90%" height={14} sx={{ mt: 1.5 }} />
            <PremiumSkeleton width="72%" height={14} sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
        <Stack spacing={1} sx={{ width: { xs: "100%", lg: 160 }, flexShrink: 0 }}>
          <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 99 }} />
        </Stack>
      </Box>
    </Card>
  );
});

/* ─── JobListingsSkeleton ──────────────────────────────────────────────── */
export const JobListingsSkeleton = memo(function JobListingsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading job listings"
      sx={{ ...safeContainerSx, display: "grid", gap: 3 }}
    >
      {/* Filter bar */}
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "2fr 1fr 1fr 1fr",
            },
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i}>
              <PremiumSkeleton width="30%" height={12} sx={{ mb: 0.75 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
      </Card>

      {/* Results heading */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <PremiumSkeleton width={180} height={26} />
      </Box>

      {/* Job cards */}
      <Stack spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <JobListingCardSkeleton key={i} />
        ))}
      </Stack>

      {/* Pagination */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: "center", mt: 1 }}
      >
        <PremiumSkeleton width={80} height={36} sx={{ borderRadius: 2 }} />
        <PremiumSkeleton width={100} height={36} sx={{ borderRadius: 2 }} />
        <PremiumSkeleton width={60} height={36} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  );
});

/* ─── JobDetailsSkeleton ───────────────────────────────────────────────── */
export const JobDetailsSkeleton = memo(function JobDetailsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading job details"
      sx={{ ...safeContainerSx, maxWidth: 960, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      {/* Hero card */}
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <PremiumSkeleton width="50%" height={30} />
              <PremiumSkeleton width={60} height={24} sx={{ borderRadius: 99 }} />
              <PremiumSkeleton width={72} height={24} sx={{ borderRadius: 99 }} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <PremiumSkeleton width="16%" height={16} />
              <PremiumSkeleton width="12%" height={16} />
              <PremiumSkeleton width="18%" height={16} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <PremiumSkeleton width="14%" height={14} />
              <PremiumSkeleton width="18%" height={14} />
            </Stack>
          </Box>
          <Stack spacing={1.5} sx={{ width: { xs: "100%", md: 180 }, flexShrink: 0 }}>
            <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 2 }} />
            <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 2 }} />
            <PremiumSkeleton width="60%" height={12} sx={{ alignSelf: "flex-end" }} />
          </Stack>
        </Box>
        {/* Skills row */}
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid var(--app-border)" }}>
          <PremiumSkeleton width="12%" height={12} sx={{ mb: 1.5 }} />
          <Stack direction="row" spacing={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <PremiumSkeleton key={i} width={72} height={28} sx={{ borderRadius: 99 }} />
            ))}
          </Stack>
        </Box>
      </Card>

      {/* Content grid — lg:grid-cols-3 */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
        }}
      >
        {/* Left column — description cards */}
        <Stack spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
              <PremiumSkeleton width="30%" height={22} sx={{ mb: 2 }} />
              <PremiumSkeleton width="100%" height={14} />
              <PremiumSkeleton width="95%" height={14} sx={{ mt: 1 }} />
              <PremiumSkeleton width="88%" height={14} sx={{ mt: 1 }} />
              <PremiumSkeleton width="72%" height={14} sx={{ mt: 1 }} />
            </Card>
          ))}
        </Stack>

        {/* Right column — sidebar */}
        <Stack spacing={3}>
          <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
            <PremiumSkeleton width="40%" height={20} sx={{ mb: 2.5 }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <PremiumSkeleton width="28%" height={12} />
                <PremiumSkeleton width="60%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Card>
          <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 3 }} />
          <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 3 }} />
        </Stack>
      </Box>
    </Box>
  );
});

/* ─── ApplicationManagementSkeleton ────────────────────────────────────── */
export const ApplicationManagementSkeleton = memo(function ApplicationManagementSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
      sx={{ ...safeContainerSx, maxWidth: 960, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      {/* Title */}
      <PremiumSkeleton width={200} height={30} />

      {/* Stats row — grid-cols-2 sm:grid-cols-4 */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(4, 1fr)",
          },
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 2.5, textAlign: "center" }}>
            <PremiumSkeleton width="50%" height={28} sx={{ mx: "auto" }} />
            <PremiumSkeleton width="40%" height={12} sx={{ mt: 1, mx: "auto" }} />
          </Card>
        ))}
      </Box>

      {/* Application cards */}
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <PremiumSkeleton width="40%" height={20} />
                  <PremiumSkeleton width={72} height={20} sx={{ borderRadius: 99 }} />
                </Stack>
                <PremiumSkeleton width="25%" height={14} sx={{ mt: 0.5 }} />
                <PremiumSkeleton width="18%" height={12} sx={{ mt: 1 }} />
                <PremiumSkeleton width="85%" height={14} sx={{ mt: 1.5 }} />
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <PremiumSkeleton width={100} height={36} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={80} height={36} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={80} height={36} sx={{ borderRadius: 99 }} />
              </Stack>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
});

/* ─── ApplicationDetailSkeleton ────────────────────────────────────────── */
export const ApplicationDetailSkeleton = memo(function ApplicationDetailSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading application detail"
      sx={{ ...safeContainerSx, maxWidth: 896, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      {/* Breadcrumb */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <PremiumSkeleton width={50} height={16} />
        <PremiumSkeleton width={8} height={16} />
        <PremiumSkeleton width={130} height={16} />
      </Stack>

      {/* Status banner */}
      <Card elevation={0} sx={{ ...cardSafeSx, p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PremiumSkeleton width={60} height={12} />
            <PremiumSkeleton width={120} height={26} sx={{ mt: 0.5 }} />
          </Box>
          <PremiumSkeleton width={200} height={36} sx={{ borderRadius: 2 }} />
        </Box>
      </Card>

      {/* Details grid — md:grid-cols-2 */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
            <PremiumSkeleton width="30%" height={20} sx={{ mb: 2 }} />
            {Array.from({ length: 3 }).map((_, j) => (
              <Box key={j} sx={{ mb: 1.5 }}>
                <PremiumSkeleton width="24%" height={12} />
                <PremiumSkeleton width="55%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            ))}
            {i === 1 && (
              <PremiumSkeleton width={110} height={36} sx={{ borderRadius: 2, mt: 1 }} />
            )}
          </Card>
        ))}
      </Box>

      {/* Cover letter card */}
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
        <PremiumSkeleton width="20%" height={20} sx={{ mb: 2 }} />
        <PremiumSkeleton width="100%" height={14} />
        <PremiumSkeleton width="95%" height={14} sx={{ mt: 1 }} />
        <PremiumSkeleton width="80%" height={14} sx={{ mt: 1 }} />
        <PremiumSkeleton width="60%" height={14} sx={{ mt: 1 }} />
      </Card>

      {/* Withdraw button */}
      <PremiumSkeleton width={170} height={38} sx={{ borderRadius: 2 }} />
    </Box>
  );
});

/* ─── SavedJobsSkeleton ────────────────────────────────────────────────── */
export const SavedJobsSkeleton = memo(function SavedJobsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading saved jobs"
      sx={{ ...safeContainerSx, maxWidth: 960, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      {/* Header row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <PremiumSkeleton width={160} height={28} />
          <PremiumSkeleton width={300} height={16} sx={{ mt: 1 }} />
        </Box>
        <PremiumSkeleton width={140} height={38} sx={{ borderRadius: 99 }} />
      </Box>

      {/* Job cards */}
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <PremiumSkeleton width="40%" height={22} />
                  <PremiumSkeleton width={60} height={20} sx={{ borderRadius: 99 }} />
                  <PremiumSkeleton width={72} height={20} sx={{ borderRadius: 99 }} />
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                  <PremiumSkeleton width="18%" height={14} />
                  <PremiumSkeleton width="14%" height={14} />
                  <PremiumSkeleton width="16%" height={14} />
                </Stack>
                <Stack direction="row" spacing={1}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <PremiumSkeleton key={j} width={60} height={22} sx={{ borderRadius: 99 }} />
                  ))}
                </Stack>
              </Box>
              <Stack spacing={1} sx={{ width: { xs: "100%", sm: 130 }, flexShrink: 0 }}>
                <PremiumSkeleton width="100%" height={36} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width="100%" height={36} sx={{ borderRadius: 99 }} />
              </Stack>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
});

/* ─── ProfileEditSkeleton (Talent & Company) ───────────────────────────── */
export const ProfileEditSkeleton = memo(function ProfileEditSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading profile editor"
      sx={{ ...safeContainerSx, maxWidth: 896, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PremiumSkeleton width={200} height={26} />
        <PremiumSkeleton width={160} height={16} />
      </Box>

      {/* Form card */}
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
        <Stack spacing={3}>
          {/* 2-col field grid — 6 rows */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <Box key={i}>
                <PremiumSkeleton width="35%" height={12} sx={{ mb: 0.75 }} />
                <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
              </Box>
            ))}
          </Box>

          {/* Textarea */}
          <Box>
            <PremiumSkeleton width="10%" height={12} sx={{ mb: 0.75 }} />
            <PremiumSkeleton width="100%" height={90} sx={{ borderRadius: 2 }} />
          </Box>

          {/* CRUD sections (experience, projects, etc.) */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} elevation={0} sx={{ ...cardSafeSx, p: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
                <PremiumSkeleton width={24} height={24} sx={{ borderRadius: 1.5 }} />
                <PremiumSkeleton width={120} height={20} />
              </Stack>
              <PremiumSkeleton width="100%" height={48} sx={{ borderRadius: 2 }} />
            </Card>
          ))}

          {/* File uploads */}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Box>
              <PremiumSkeleton width="20%" height={12} sx={{ mb: 0.75 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
            </Box>
            <Box>
              <PremiumSkeleton width="20%" height={12} sx={{ mb: 0.75 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>

          {/* Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            <PremiumSkeleton width={120} height={40} sx={{ borderRadius: 99 }} />
            <PremiumSkeleton width={80} height={40} sx={{ borderRadius: 99 }} />
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
});

/* ─── JobEditSkeleton ──────────────────────────────────────────────────── */
export const JobEditSkeleton = memo(function JobEditSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading job editor"
      sx={{ ...safeContainerSx }}
    >
      {/* Top bar */}
      <Box sx={{ borderBottom: "1px solid var(--app-border)", px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box sx={{ maxWidth: 896, mx: "auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <PremiumSkeleton width={160} height={22} />
          <PremiumSkeleton width={50} height={16} />
        </Box>
      </Box>

      {/* Form card */}
      <Box sx={{ maxWidth: 896, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
        <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
          <Stack spacing={3}>
            {/* Section 1: Basic Info */}
            <Box>
              <PremiumSkeleton width="14%" height={18} sx={{ mb: 2 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2, mb: 2 }} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i}>
                    <PremiumSkeleton width="35%" height={12} sx={{ mb: 0.75 }} />
                    <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
                <PremiumSkeleton width={18} height={18} sx={{ borderRadius: 1 }} />
                <PremiumSkeleton width={160} height={14} />
              </Stack>
            </Box>

            {/* Section 2: Details */}
            <Box>
              <PremiumSkeleton width="10%" height={18} sx={{ mb: 2 }} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <PremiumSkeleton width="18%" height={12} sx={{ mb: 0.75 }} />
                  <PremiumSkeleton width="100%" height={i === 0 ? 90 : 70} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>

            {/* Section 3: Skills & Compensation */}
            <Box>
              <PremiumSkeleton width="22%" height={18} sx={{ mb: 2 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2, mb: 2 }} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                <Box>
                  <PremiumSkeleton width="35%" height={12} sx={{ mb: 0.75 }} />
                  <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                </Box>
                <Box>
                  <PremiumSkeleton width="35%" height={12} sx={{ mb: 0.75 }} />
                  <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                </Box>
              </Box>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, mt: 2 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i}>
                    <PremiumSkeleton width="40%" height={12} sx={{ mb: 0.75 }} />
                    <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Submit button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2, borderTop: "1px solid var(--app-border)" }}>
              <PremiumSkeleton width={120} height={38} sx={{ borderRadius: 99 }} />
            </Box>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
});

/* ─── CompanyApplicationsSkeleton ──────────────────────────────────────── */
export const CompanyApplicationsSkeleton = memo(function CompanyApplicationsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
      sx={{ ...safeContainerSx, maxWidth: 1152, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      {/* Title */}
      <PremiumSkeleton width={220} height={30} />

      {/* Job selector card */}
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 2.5 }}>
        <PremiumSkeleton width="10%" height={12} sx={{ mb: 1 }} />
        <PremiumSkeleton width={360} height={38} sx={{ borderRadius: 2 }} />
      </Card>

      {/* Selected job info card */}
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 2.5 }}>
        <PremiumSkeleton width="30%" height={22} />
        <PremiumSkeleton width="24%" height={14} sx={{ mt: 0.75 }} />
      </Card>

      {/* Pipeline grid — xl:grid-cols-[1.2fr_repeat(3,1fr)] with 2 rows */}
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 2.5 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              xl: "1.2fr repeat(3, 1fr)",
            },
            gridTemplateRows: {
              xl: "repeat(2, minmax(260px, 1fr))",
            },
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <Card
              key={i}
              className="glass-card"
              elevation={0}
              sx={{
                ...cardSafeSx,
                minHeight: i === 0 ? 320 : 240,
                ...(i === 0 && { gridRow: { xl: "1 / span 2" } }),
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: "1px solid var(--app-border)", display: "flex", justifyContent: "space-between" }}>
                <PremiumSkeleton width={80} height={16} />
                <PremiumSkeleton width={24} height={20} sx={{ borderRadius: 99 }} />
              </Box>
              <Box sx={{ p: 1.5 }}>
                {Array.from({ length: i === 0 ? 3 : 2 }).map((_, j) => (
                  <Card key={j} elevation={0} sx={{ ...cardSafeSx, p: 2, mb: 1.5 }}>
                    <PremiumSkeleton width="60%" height={16} />
                    <PremiumSkeleton width="40%" height={12} sx={{ mt: 0.75 }} />
                    <PremiumSkeleton width="100%" height={30} sx={{ mt: 1.5, borderRadius: 2 }} />
                  </Card>
                ))}
              </Box>
            </Card>
          ))}
        </Box>
      </Card>
    </Box>
  );
});

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return <TalentDashboardSkeleton />;
});

export const FullPageLoader = memo(function FullPageLoader() {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        ...safeContainerSx,
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack spacing={1.5} sx={{ width: 240, alignItems: "center" }}>
        <PremiumSkeleton width={48} height={48} sx={{ borderRadius: 999 }} />
        <PremiumSkeleton width="52%" height={16} />
      </Stack>
      <Box component="span" sx={srOnlySx}>
        Loading
      </Box>
    </Box>
  );
});
