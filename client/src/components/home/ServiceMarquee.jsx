import services from "../../data/services";

function ServiceGroup({ duplicate = false }) {
  return (
    <div className="flex min-w-screen shrink-0">
      {services.map((service) => {
        const Icon = service.icon;

        return (
          <div
            key={`${duplicate ? "duplicate-" : ""}${service.id}`}
            className="
              flex
              min-w-1/4
              flex-1
              items-center
              gap-3
              border-r
              border-outline-variant
              px-5
              py-4
              sm:px-6
              sm:py-5
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
              <Icon size={19} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="whitespace-nowrap text-sm font-semibold text-text">
                {service.title}
              </p>

              <p className="mt-0.5 whitespace-nowrap text-xs leading-5 text-text-secondary">
                {service.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ServiceMarquee() {
  return (
    <section className="overflow-hidden border-y border-outline-variant bg-surface">
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee">
          <ServiceGroup />
          <ServiceGroup duplicate />
        </div>
      </div>
    </section>
  );
}

export default ServiceMarquee;
